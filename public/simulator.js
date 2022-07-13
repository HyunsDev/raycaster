/* eslint-disable no-restricted-globals */

let wall = []
let mousePosition = {x: 0, y: 0}
let screenSize = { width: 0, height: 0 }
let layQuota = 16

const isPointInBox = (pointPosition, boxPosition) => {
    let x = pointPosition.x < boxPosition.x2 && pointPosition.x > boxPosition.x1
    let y = pointPosition.y < boxPosition.y2 && pointPosition.y > boxPosition.y1
    return x && y
}

const directionVectors = [[0,1], [0, -1], [1, 0], [-1, 0], [1,1], [-1, 1], [1, -1], [-1, -1], [1,2], [2,1], [-1,2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]

let paintTimer = null;
function calculation(pos) {
    let result = []

    if (paintTimer) return
    paintTimer = setTimeout(() => {
        for ( const directionVector of directionVectors) {
            let newPoint = pos
            loop:
            while (true) {
                newPoint = { x: newPoint.x + directionVector[0] , y: newPoint.y + directionVector[1]}
                for (const box of Object.values(wall)) {
                    if (isPointInBox(newPoint, box)) {
                        result.push(newPoint)
                        break loop
                    }
                }
                if (
                    newPoint.x > screenSize.width 
                    || newPoint.x < 0
                    || newPoint.y > screenSize.height 
                    || newPoint.y < 0
                    ) {
                    result.push(newPoint)
                    break
                }
            }
    
            self.postMessage({code: 'result', data: {
                mousePosition: pos,
                points: result
            }})
        }
        paintTimer = null
    }, 16)
}

// IO
self.addEventListener('message', event => {
    switch (event.data.code) {
        case 'ping':
            self.postMessage({code: 'pong'})
            break

        case 'wall':
            wall = event.data.data
            console.log(wall)
            break

        case 'mousePosition':
            mousePosition = event.data.data
            calculation(mousePosition)
            break

        case 'screenSize':
            screenSize = event.data.data
            break

        case 'layQuota':
            layQuota = event.data.data
            break

        default:
            console.error(`Wrong Command: '${event.data.code}' `)
    }
})
