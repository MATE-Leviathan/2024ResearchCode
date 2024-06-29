import './App.css'
import { useEffect, useState } from 'react'
import Chart from 'react-apexcharts';

export default function App() {
  const ip = "http://10.50.2.100:5000/"
  const [x1, setX1] = useState(0);
  const [y1, setY1] = useState(0);
  const [x2, setX2] = useState(0);
  const [y2, setY2] = useState(0);
  const [datas, setDatas] = useState([]);
  const [yButton, setYButton] = useState(false);
  const [aButton, setAButton] = useState(false);
  const [connection, setConnection] = useState(false);
  const [positions, setPositions] = useState([{}]);
  let [tD, setTD] = useState([]);
  let [tT, setTT] = useState([]);
useEffect(()=>{
  let strafeLink = '';
  let turnLink = '';
  let light = '';
  const interval = setInterval(async()=>{
    if(!connection){
      try{fetch(ip)
        .then((response) => response.json())
        .then((data) => {
          setConnection(true)
        })
      }
      catch{}
    }
    const controller = navigator.getGamepads()[0];
    if(controller){
      let s1 = document.getElementById("stick1")
      let s2 = document.getElementById("stick2")
      if(s1 && s2){
        s1.style.backgroundColor = "lightgreen"
        s1.style.borderColor = "lightgreen"
        s2.style.backgroundColor = "lightgreen"
        s2.style.borderColor = "lightgreen"
      }
      let foo = "";
      let prevStrafe = strafeLink;
      let prevTurn = turnLink;
      let prevLight = light;
      strafeLink = '' + ip + 'strafe?x='+(Math.round(controller.axes[0] * 10) / 10)+'&y='+(-Math.round(controller.axes[1] * 10) / 10)+'&z='+(-Math.round(controller.axes[3] * 10) / 10)
      turnLink = '' + ip + 'turn?mag='+(Math.round(controller.axes[2] * 10) / 10)
      setX1(Math.round(controller.axes[0] * 10) / 10)
      setY1(-Math.round(controller.axes[1] * 10) / 10)
      setX2(Math.round(controller.axes[2] * 10) / 10)
      setY2(-Math.round((controller.buttons[7].value-controller.buttons[6].value) * 10) / 10)
      setYButton(controller.buttons[5].pressed)
      setAButton(controller.buttons[0].pressed)
}
  else{
    let s1 = document.getElementById("stick1")
    let s2 = document.getElementById("stick2")
    if(s1 && s2){
      s1.style.backgroundColor = "rgba(100,100,100,0.5)"
      s1.style.borderColor = "rgba(100,100,100,0.5)"
      s2.style.backgroundColor = "rgba(100,100,100,0.5)"
      s2.style.borderColor = "rgba(100,100,100,0.5)"
    }
  }
  }, connection?10:1000);
})

useEffect(()=>{
  let zLock = (sessionStorage.getItem("zLock") == 1)?(true):(false)
  if(!zLock){
  fetch("" + ip + "strafe?x=" + x1 + "&y=" + y1 + "&z=" + y2)
       .then((response) => response.json())
  }
  else{
    fetch("" + ip + "strafe?x=" + x1 + "&y=" + y1 + "&z=" + (-2))
       .then((response) => response.json())
  }
}, [x1, y1, y2, aButton])

useEffect(()=>{
  fetch("" + ip + "turn?mag=" + x2)
       .then((response) => response.json())
}, [x2])
useEffect(()=>{
  const interval = setInterval(async()=>{
    fetch(ip)
    .then((response) => response.json())
    .then((data) => {
     setDatas(data)
    })
  }, 200);
},[])
/* This is the graphing code that makes the ui slower
useEffect(()=>{
  if(sessionStorage.getItem("graphing") == 1){
      setTD(prevTD => [...prevTD, datas?.external?.depth]);
      setTT(prevTT => [...prevTT, datas?.external?.temp]);
      if(tD.length >= 20){
        tD = tD.shift();
      }
      if(tT.length >= 20){
        tT = tT.shift();
      }
    }
},[datas])
*/
useEffect(()=>{
  if(yButton){
    fetch("" + ip + "light?brightness=180")
       .then((response) => response.json())
       if(document.getElementById("lightSlider")){
        document.getElementById("lightSlider").value = 180;
       }
  }
  else{
    fetch("" + ip + "light?brightness=0")
       .then((response) => response.json())
       if(document.getElementById("lightSlider")){
        document.getElementById("lightSlider").value = 0;
       }
  }
}, [yButton])
useEffect(()=>{
  const interval = setInterval(async()=>{
    let zLock = (sessionStorage.getItem("zLock") == 1)?(true):(false)
    let depLock = sessionStorage.getItem("depLock")
    if(zLock && depLock != 0){
      fetch("" + ip + "zlock?bar=" + depLock)
      .then((response) => response.json())
      console.log(zLock, depLock)
      document.getElementById("zLock").style.backgroundColor = "lightblue"
      document.getElementById("zLock").style.color = "black"
    }
    else if(zLock){
      document.getElementById("zLock").style.backgroundColor = "lightblue"
      document.getElementById("zLock").style.color = "black"
    }
    else{
      document.getElementById("zLock").style.backgroundColor = ""
      document.getElementById("zLock").style.color = ""
    }
  }, 50);
}, [sessionStorage.getItem("zLock")])

useEffect(()=>{
  if(document.getElementById("yawLine")){
    document.getElementById("yawLine").style.rotate = (((datas?.pos?.yaw)?(datas.pos.yaw):0)+90) + "deg"
    console.log((((datas?.pos?.yaw)?(datas.pos.yaw):0)+90) + "deg")
  }
  if(document.getElementById("rpline")){
    document.getElementById("rpline").style.rotate = ((datas?.pos?.roll)?(datas.pos.roll):0) + "deg"
    document.getElementById("rpline").style.translate = "0px " + (((datas?.pos?.pitch)?(datas.pos.pitch):0)-70) + "px"
    console.log("0px " + (((datas?.pos?.pitch)?(datas.pos.pitch):0)-70) + "px")
  }
}, [datas?.pos?.roll, datas?.pos?.pitch, datas?.pos?.yaw, datas?.pos?.temp, aButton])

useEffect(()=>{
  setPositions(datas?.positions);
}, [datas?.positions])

  return (
    <div>
      <div className='cardGrid'>
      <div className="card" style={{width: "62vw", height: "95vh", marginLeft: "24px"}}>
        <h3 className="cardTitle">Camera Stream #1</h3>
        <center style={{backgroundColor: "rgba(0,0,0,0)"}}>
        <img
          src={ip + "video_feed"}
          width="auto"
          height="112%"
          style={{borderRadius: "5px", marginLeft: "17%", marginTop: "-40%"}}
        ></img>
        
        </center>
        {(datas?.pos?.roll)?(<p></p>):(<p className='camError'>No Camera Stream Detected</p>)}
        <div className="container" style={{position: "absolute", backgroundColor: "rgba(0,0,0,0)", bottom: "0px", left: "50px"}}>
        <div className="rpcompass" style={{backgroundColor: "rgba(0,0,0,0)", bottom: "0px", marginLeft: "0px", marginRight: "3%", marginBottom: "40px"}}><div className="rollpitchtick1"></div><div className="rollpitchtick2"></div><div className="rollpitchtick3"></div><div className="rollpitchtick4"></div><div className="rollpitchtick5"></div><div className="rollpitchtick6"></div><div className="rollpitchtick7"><div className="rollpitchLine" id="rpline"></div></div><small className="depth">Depth: {datas?.external?.depth?Math.round(datas?.external?.depth):"00"} ft</small></div>
        <p style={{marginLeft: "10px", height: "12px", marginTop: "150px"}}>Temperature: {datas?.external?.temp?Math.round(datas?.external?.temp*100)/100:"00"} °F</p>
        <p style={{marginLeft: "80px", height: "12px", marginTop: "150px"}}>Barometric Pressure: {datas?.external?.pressure?Math.round(datas?.external?.pressure*100)/100:"00"} psi</p>
        <p style={{marginLeft: "80px", height: "12px", marginTop: "150px"}}>IMU Temp: {datas?.pos?.temp?datas?.pos?.temp:"00"} °F</p>
        <div className="yawcompass" style={{backgroundColor: "rgba(0,0,0,0)", bottom: "0px", marginLeft: "3%", marginRight: "0px", position: "absolute", bottom: "40px", right: "40vw"}}><div className="yawLine" id="yawLine"></div></div>
       
        </div>
      </div>
      <br></br>
      <div className="card" style={{width: "30vw", height: "40vh", position: "absolute", right: "24px", top: "24px"}}>
        <h3 className="cardTitle">Control System</h3>
        <div className="connect" style={{borderColor: (connection?"lightgreen":"red")}}></div>
        <button className="lockZ" id="zLock" style={{backgroundColor: (sessionStorage.getItem("zLock") == 1)?("lightblue"):(""), color: (sessionStorage.getItem("zLock") == 1)?("black"):("")}} onClick={(e)=>{sessionStorage.setItem("zLock", (sessionStorage.getItem("zLock") == 1)?(0):(1)); sessionStorage.setItem("depLock", Math.round(datas?.external?.pressure*100)/100)}}>Lock Z</button>
        <div className="joysticks">
          <div className="joystick"><div className="stickPos" id="stick1" style={{marginTop: ((-y1/2+0.5)*60-6)+"px", marginLeft: ((x1/2+0.5)*60-6)+"px"}}></div></div>
          <div className="joystick"><div className="stickPos" id="stick2" style={{marginTop: ((-y2/2+0.5)*60-6)+"px", marginLeft: ((x2/2+0.5)*60-6)+"px"}}></div></div>
        </div>
        <input type="range" min="0" max="180" defaultValue="0" className="lights" id="lightSlider" onChange={(e)=>{if(document.getElementById("lightSlider")){document.getElementById("lightSlider").style.backgroundColor = "rgb(255, 255, " + (180-document.getElementById("lightSlider").value)/180*255 + ")";}}} onMouseUp={(e)=>{if(document.getElementById("lightSlider")){fetch("" + ip + "light?brightness=" + document.getElementById("lightSlider").value)
         .then((response) => response.json())}}}></input>
         <button onClick={(e)=>{fetch(ip + "testThruster?t=1")}}>Test Thruster 1</button> <button onClick={(e)=>{fetch(ip + "testThruster?t=2")}}>Test Thruster 2</button> <button onClick={(e)=>{fetch(ip + "testThruster?t=3")}}>Test Thruster 3</button><button onClick={(e)=>{fetch(ip + "testThruster?t=4")}}>Test Thruster 4</button> <button onClick={(e)=>{fetch(ip + "testThruster?t=5")}}>Test Thruster 5</button> <button onClick={(e)=>{fetch(ip + "testThruster?t=6")}}>Test Thruster 6</button>
      </div>
      <div className="card" style={{width: "30vw", position: "absolute", right: "24px", marginTop: "390px", height: "49vh"}}>
        <h3 className="cardTitle">Map</h3>
        {(positions?.map(({x, y, z, latest}) => {
              return(
                <div className={"mapDot"+((latest == true)?(" presentDot"):(""))} style={{left: ((50+x*1000/2)+"%"), top: ((50+y*1000/2)+"%")/*,backgroundColor: (!latest)?("rgb(" + (5*z+100) + "," + (5*z+100) + "," + (5*z+100) + ")"):("auto")*/}}></div>
              );
            }
          ))}
          <div className="mapDot startDot"></div>
      </div>
      <div className="card" style={{width: "96vw", height: "96vh", position: "absolute", left: "31px", top: "104vh", marginBottom: "24px"}}>
        <h2 className="cardTitle">Charts</h2>
          <div className="GraphButtons" >
            <button className="gb" onClick={(e)=>{sessionStorage.setItem("graphing", 1)}}>Start</button>
            <button className="gb stopgb" style={{borderColor: "red"}} onClick={(e)=>{sessionStorage.setItem("graphing", 0)}}>Stop</button>
            <button className="gb resetgb" style={{borderColor: "orange"}} onClick={(e)=>{setTD([]); setTT([]);}}>Reset</button>
            <Chart options={{chart: {
                height: 500,
                type: 'line',
                zoom: {
                  enabled: false
                },
                toolbar: {
                  show: false
                }
              },
              tooltip: {
                enabled: false
              },
              dataLabels: {
                enabled: false
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'smooth'
              },
              xaxis: {
                labels: {
                  style: {
                    colors: '#FFFFFF'
                  }
                },
                axisBorder: {
                  color: '#FFFFFF'
                },
                axisTicks: {
                  color: '#FFFFFF'
                },
              },
              yaxis: {
                labels: {
                  style: {
                    colors: '#FFFFFF'
                  }
                },
                axisBorder: {
                  color: '#FFFFFF'
                },
                axisTicks: {
                  color: '#FFFFFF'
                },
              },
              title: {
                text: 'Time Vs. Depth',
                align: 'center',
                style: {
                  color: '#FFFFFF',
                  fontSize: '20px',
                }
              },}} series={[{
                data: tD
            }]} type="line" height={500} width={600} style={{position: "absolute", top: "200%", left: "-200%"}} />
            <Chart options={{chart: {
                height: 500,
                type: 'line',
                zoom: {
                  enabled: false
                },
                toolbar: {
                  show: false
                }
              },
              tooltip: {
                enabled: false
              },
              dataLabels: {
                enabled: false
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'smooth'
              },
              xaxis: {
                labels: {
                  style: {
                    colors: '#FFFFFF'
                  }
                },
                axisBorder: {
                  color: '#FFFFFF'
                },
                axisTicks: {
                  color: '#FFFFFF'
                },
              },
              yaxis: {
                labels: {
                  style: {
                    colors: '#FFFFFF'
                  }
                },
                axisBorder: {
                  color: '#FFFFFF'
                },
                axisTicks: {
                  color: '#FFFFFF'
                },
              },
              title: {
                text: 'Time Vs. Temperature',
                align: 'center',
                style: {
                  color: '#FFFFFF',
                  fontSize: '20px',
                }
              },}} series={[{
                data: tT
            }]} type="line" height={500} width={600} style={{position: "absolute", top: "200%", left: "70%"}} />
          </div>
      </div>
      </div>
    </div>
  )
}
