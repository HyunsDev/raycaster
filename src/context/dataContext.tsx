import React, { createContext, useCallback, useEffect, useState } from "react";

type wall = {
    x1: number,
    y1: number,
    x2: number, 
    y2: number,
}

interface DataType {
    wall: {
        [key: string]: wall
    }
}

// 설정 파일 불러오기
const initData:DataType = {
    wall: {}
}

export const DataContext = createContext({
    data: initData,
    setData: (data: DataType) => {},
    updateData: <T extends keyof DataType>(key: T, value: DataType[T]) => {}
})

const DataProvider = ({children}: {children: React.ReactNode}) => {
    const [ data, setData ] = useState<DataType>(initData)

    const updateData = useCallback(<T extends keyof DataType>(key: T, value: DataType[T]) => {
        const newData= {
            ...data,
            [key]: value
        }
        setData(newData)
    }, [data])

    return (
        <DataContext.Provider
            value={{
                data,
                setData,
                updateData
            }}
        >
            {children}
        </DataContext.Provider>
    )
}

export default DataProvider;
