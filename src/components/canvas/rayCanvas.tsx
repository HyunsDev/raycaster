import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useData } from "../../hook/useData";
import { useToast } from "../../hook/useToast";
import { v4 as uuidv4 } from 'uuid'
import { useWorker } from "../../hook/useWorker";


const Canvas = styled.canvas`
    cursor: crosshair;
    position: absolute;
    left: 0;
    top: 0;
    user-select: none;
`

type vector = {
    x: number;
    y: number;
}

interface CanvasProps {

}

interface resultData {
    mousePosition: vector
    points: vector[]
}

export function RayCanvas(props: CanvasProps) {
    const toast = useToast()
    const data = useData()
    const worker = useWorker()

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const requestAnimationRef = useRef<any>(null)

    useEffect(() => {
        const resize = () => {
            if (canvasRef.current) {
                canvasRef.current.width=window.innerWidth
                canvasRef.current.height=window.innerHeight
            }
        }

        resize()
        window.addEventListener('resize', resize)
        return () => {
            window.removeEventListener('resize', resize)
        }
    }, [])

    const drawLine = useCallback((x1: number, y1: number, x2:number, y2: number, strokeColor: string = 'rgba(255, 255, 255, 0.3)') => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if(!context) return

        context.strokeStyle = strokeColor;
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }, [])

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if(!context) return

        let listener = worker.addListener('result', (data: resultData) => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            data.points.forEach(e => {
                drawLine(data.mousePosition.x, data.mousePosition.y, e.x, e.y)
            })
        })
        return () => {
            worker.removeListener(listener)
        }
    }, [drawLine, worker])


    return (
        <Canvas ref={canvasRef} />
    )
}