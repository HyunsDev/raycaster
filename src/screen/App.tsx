import React, { useCallback, useEffect, useState } from 'react';
import { Controller, Button, Labels, Label, NumberField } from '../components';
import { DrawCanvas } from '../components/canvas/drawCanvas';
import { MapCanvas } from '../components/canvas/mapCanvas';
import { RayCanvas } from '../components/canvas/rayCanvas';
import { useToast } from '../hook/useToast';
import { useWorker } from '../hook/useWorker';
import { ReactComponent as GithubSvg } from '../assets/github.svg'
import {
  Play,
  Pause,
  Cursor as CursorIcon,
  CaretRight,
  CaretLeft,
  ArrowsOutCardinal,
  PlusCircle,
  Plus,
  Minus,
  ArrowsOut,
  ArrowsIn,
  ArrowClockwise,
  Trash
} from "phosphor-react";
import { useData } from '../hook/useData';
import styled from 'styled-components';

const GithubIcon = styled(GithubSvg)`
    position: fixed;
    width: 24px;
    height: 24px;
    top: 36px;
    left: 36px;   
    user-select: none;
    fill: #ffffff;
`

function App() {
  const toast = useToast()
  const worker = useWorker()
  const data = useData()

  const [ layQuota, setLayQuota ] = useState(16)

  useEffect(() => {
    toast('Hello, world!')
  }, [toast])

  useEffect(() => {
    const func = (e: MouseEvent) => {
      worker.requestWorker('mousePosition', { x: e.pageX, y: e.pageY })
    }

    window.addEventListener('mousemove', func)
    return () => { window.removeEventListener('mousemove', func) }
  }, [worker])

  useEffect(() => {
    const resize = () => {
      worker.requestWorker('screenSize', { width: window.innerWidth, height: window.innerHeight })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [worker])

  useEffect(() => {
    worker.requestWorker('layQuota', layQuota)
  }, [layQuota, worker])

  const reset = useCallback(() => {
    data.setData({wall: {}})
    worker.requestWorker('wall', [])
  }, [data, worker])

  return (
    <div className="App">
      <RayCanvas />
      <MapCanvas />
      <DrawCanvas />

      <Controller right={20} top={20} minWidth={200}>
        <Labels>
          <Label name={'현재 박스 수'} value={Object.keys(data.data.wall || {}).length}/>
      </Labels>
      </Controller>

      {/* <Controller left={20} bottom={60}>
        <NumberField
          label="선 개수" 
          value={layQuota} 
          onChange={(value) => setLayQuota(value)} 
          min={1} 
          max={100} 
          step={1} 
      />
      </Controller> */}

      <a href="https://github.com/HyunsDev/raycaster" target={"_blank"} rel="noreferrer">
        <GithubIcon /> 
      </a>

      <Controller left={20} bottom={20}>
        <Button content={<Trash />} tooltip='초기화 [ r ]' onClick={() => reset()} />
        <Button content={<ArrowClockwise />} tooltip='새로고침 [ ctrl r ]' onClick={() => window.location.reload()} />
      </Controller>
    </div>
  );
}

export default App;
