'''
Written by Rohan Tyagi, Stephen Zhou, Everett Tucker, Romeer Dhillon
Research robot code as written in SRIP summer.
'''
#importing libraries
import adafruit_bno055
import flask
import cv2
from flask import jsonify, request, make_response, Flask, Response
from flask_cors import CORS, cross_origin
import board
import busio
import time
import adafruit_pca9685
from adafruit_motor import servo
import math
import tsys01
import ms5837
import smbus2
#initialize flask API
app = flask.Flask(__name__)
CORS(app)
#initialize sensors
i2c_bus = busio.I2C(board.SCL, board.SDA)
pca = adafruit_pca9685.PCA9685(i2c_bus, address=0x41)
pca.frequency = 450
pca.channels[0].duty_cycles = 0xffff
imu = adafruit_bno055.BNO055_I2C(busio.I2C(board.SCL, board.SDA), address=0x28)
celsiusSensor = tsys01.TSYS01()
baroSensor = ms5837.MS5837_30BA()
#setting median pulse widths and angles
mpulse = 1370
mangle = 90
#initialize thrusters
#oscilloscope = servo.Servo(pca.channels[12], min_pulse = mpulse, max_pulse = 1900)
fr1 = servo.Servo(pca.channels[0], min_pulse = mpulse, max_pulse = 1900)
mr2 = servo.Servo(pca.channels[1], min_pulse = mpulse, max_pulse = 1900)
br3 = servo.Servo(pca.channels[2], min_pulse = mpulse, max_pulse = 1900)
bl4 = servo.Servo(pca.channels[3], min_pulse = mpulse, max_pulse = 1900)
ml5 = servo.Servo(pca.channels[4], min_pulse = mpulse, max_pulse = 1900)
fl6 = servo.Servo(pca.channels[5], min_pulse = mpulse, max_pulse = 1900)
flashlight = servo.Servo(pca.channels[6], min_pulse = 1100, max_pulse = 1900)
fr1.angle = mangle
mr2.angle = mangle
br3.angle = mangle
bl4.angle = mangle
ml5.angle = mangle
fl6.angle = mangle
flashlight.angle = 0
#oscilloscope.angle = mangle
#initialize temp and pressure sensors
celsiusSensor.init()
celsiusSensor.read()
baroSensor.init()
baroSensor.read()
#data hook
@app.route('/')
def data():
    imutemp = imu.temperature
    #print(imu.magnetic)
    #print(imu.gyro)
    yaw = imu.euler[0]
    pitch = imu.euler[1]
    roll = imu.euler[2]
    canhumidity = 0#dhtDevice.humidity
    cantemp = 0#dhtDevice.temperature
    temp = (celsiusSensor.temperature()+baroSensor.temperature(ms5837.UNITS_Centigrade))/2
    #print(temp)
    pressure = baroSensor.pressure(ms5837.UNITS_psi)
    depth = baroSensor.depth()*3.28084
    return({"pos":{"roll":roll, "pitch": pitch, "yaw": yaw, "temp": (imutemp * 9/5) + 32}, "internal":{"temp": cantemp, "humidity": canhumidity}, "external":{"temp": (temp * 9/5) + 32, "pressure":pressure, "depth":depth}})
    #return({"pos":{"roll":roll, "pitch": pitch, "yaw": yaw}})
#linear movement hook
@app.route('/strafe')
def strafe():
    x = int(float(request.args.get("x"))*90)+90
    y = int(float(request.args.get("y"))*90)+90
    z = int(float(request.args.get("z"))*90)+90
    theta = math.atan((float(request.args.get("y")))/(float(request.args.get("x"))+0.0000000000000001))*180/math.pi
    if theta < 0 and float(request.args.get("x")) < 0:
        theta += 180
    if theta < 0 and float(request.args.get("y")) < 0:
        theta += 360
    if float(request.args.get("x")) < 0 and float(request.args.get("y")) < 0:
        theta += 180
    mag = math.dist([0,0], [float(request.args.get("x")),float(request.args.get("y"))])
    print(180-(mag*90*math.sin((theta-45)*math.pi/180)+90))
    fr1.angle = 180-(mag*90*math.sin((theta-45)*math.pi/180)+90)
    br3.angle = 180-(mag*90*math.sin((theta-135)*math.pi/180)+90)
    bl4.angle = 180-(mag*90*math.sin((theta-225)*math.pi/180)+90)
    fl6.angle = 180-(mag*90*math.sin((theta+45)*math.pi/180)+90)
    if z != -2:
        mr2.angle = z
        ml5.angle = z
    else:
        pass;
    return ({"note":"strafing"})
#z-axis depth stabilization hook
@app.route('/zlock')
def zlock():
    barWanted = float(request.args.get("bar"))
    barCurrent = round(baroSensor.pressure(ms5837.UNITS_psi)*100)/100
    barChange = barWanted-barCurrent
    mr2.angle = int(barChange*30)+90
    ml5.angle = int(barChange*30)+90
    print(barChange)
    return({"note":"zlock"})
@app.route('/testThruster')
def testThruster():
    thruster = int(request.args.get("t"))
    if(thruster == 1):
        fr1.angle = 120
    if(thruster == 2):
        mr2.angle = 120
    if(thruster == 3):
        br3.angle = 120
    if(thruster == 4):
        bl4.angle = 120
    if(thruster == 5):
        ml5.angle = 120
    if(thruster == 6):
        fl6.angle = 120
    time.sleep(3)
    fr1.angle = mangle
    mr2.angle = mangle
    br3.angle = mangle
    bl4.angle = mangle
    ml5.angle = mangle
    fl6.angle = mangle
    return({"note": "testing"})
@app.route('/turn')
def turn():
    mag = int(float(request.args.get("mag"))*90)+90
    fr1.angle = mag
    br3.angle = 180-mag
    bl4.angle = mag
    fl6.angle = 180-mag
    print(mag)
    return({"note":"turning"})
@app.route('/light')
def light():
    brightness = int(request.args.get("brightness"))
    flashlight.angle = brightness
    return({"note":"light"})
def generate_frames(camera):
    while True:
        # Capture frame-by-frame
        success, frame = camera.read()
        if not success:
            print("sad")
            break
        else:
            # Encode the frame in JPEG format
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            # Concatenate frame one by one and show result
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
@app.route('/video_feed')
def video_feed():
    camera = cv2.VideoCapture(0)  # Adjust the camera index if necessary
    return Response(generate_frames(camera),
                    mimetype='multipart/x-mixed-replace; boundary=frame')
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, threaded=True)
