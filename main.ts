//% weight=100 color=#0057D9 icon="\uf26c" block="OLED SSD1306"
namespace OLED {
    let addr = 0x3C
    let width = 128
    let height = 64
    let buffer = pins.createBuffer(1025)

    const font: number[] = [
        0,0,0,0,0, 0,0,95,0,0, 0,7,0,7,0, 20,127,20,127,20,
        36,42,127,42,18, 35,19,8,100,98, 54,73,85,34,80, 0,5,3,0,0,
        0,28,34,65,0, 0,65,34,28,0, 20,8,62,8,20, 8,8,62,8,8,
        0,80,48,0,0, 8,8,8,8,8, 0,96,96,0,0, 32,16,8,4,2,
        62,81,73,69,62, 0,66,127,64,0, 66,97,81,73,70, 33,65,69,75,49,
        24,20,18,127,16, 39,69,69,69,57, 60,74,73,73,48, 1,113,9,5,3,
        54,73,73,73,54, 6,73,73,41,30, 0,54,54,0,0, 0,86,54,0,0,
        8,20,34,65,0, 20,20,20,20,20, 0,65,34,20,8, 2,1,81,9,6,
        50,73,121,65,62, 126,17,17,17,126, 127,73,73,73,54, 62,65,65,65,34,
        127,65,65,34,28, 127,73,73,73,65, 127,9,9,9,1, 62,65,73,73,122,
        127,8,8,8,127, 0,65,127,65,0, 32,64,65,63,1, 127,8,20,34,65,
        127,64,64,64,64, 127,2,12,2,127, 127,4,8,16,127, 62,65,65,65,62,
        127,9,9,9,6, 62,65,81,33,94, 127,9,25,41,70, 70,73,73,73,49,
        1,1,127,1,1, 63,64,64,64,63, 31,32,64,32,31, 63,64,56,64,63,
        99,20,8,20,99, 7,8,112,8,7, 97,81,73,69,67
    ]

    function cmd(c: number) {
        pins.i2cWriteBuffer(addr, pins.createBufferFromArray([0x00, c]))
    }

    function data(start: number, len: number) {
        let b = pins.createBuffer(len + 1)
        b[0] = 0x40
        for (let i = 0; i < len; i++) {
            b[i + 1] = buffer[start + i]
        }
        pins.i2cWriteBuffer(addr, b)
    }

    //% block="initialize OLED address %address"
    //% address.defl=60
    export function init(address: number = 0x3C) {
        addr = address
        buffer = pins.createBuffer(1025)

        cmd(0xAE)
        cmd(0xD5); cmd(0x80)
        cmd(0xA8); cmd(0x3F)
        cmd(0xD3); cmd(0x00)
        cmd(0x40)
        cmd(0x8D); cmd(0x14)
        cmd(0x20); cmd(0x00)
        cmd(0xA1)
        cmd(0xC8)
        cmd(0xDA); cmd(0x12)
        cmd(0x81); cmd(0xCF)
        cmd(0xD9); cmd(0xF1)
        cmd(0xDB); cmd(0x40)
        cmd(0xA4)
        cmd(0xA6)
        cmd(0xAF)

        clear()
    }

    //% block="clear OLED"
    export function clear() {
        for (let i = 0; i < 1024; i++) {
            buffer[i] = 0
        }
        show()
    }

    //% block="show OLED"
    export function show() {
        cmd(0x21); cmd(0); cmd(127)
        cmd(0x22); cmd(0); cmd(7)

        for (let i = 0; i < 1024; i += 16) {
            data(i, 16)
        }
    }

    //% block="draw pixel x %x y %y"
    export function pixel(x: number, y: number) {
        if (x < 0 || x >= width || y < 0 || y >= height) return

        let page = Math.idiv(y, 8)
        let bit = y % 8
        buffer[x + page * width] |= 1 << bit
    }

    //% block="write text %text at x %x y %y"
    //% text.defl="Hello!"
    export function writeText(text: string, x: number, y: number) {
        let cx = x

        for (let i = 0; i < text.length; i++) {
            let code = text.charCodeAt(i)

            if (code < 32 || code > 90) {
                code = 32
            }

            let index = (code - 32) * 5

            for (let col = 0; col < 5; col++) {
                let line = font[index + col]

                for (let row = 0; row < 8; row++) {
                    if ((line >> row) & 1) {
                        pixel(cx + col, y + row)
                    }
                }
            }

            cx += 6
        }

        show()
    }

    //% block="write number %num at x %x y %y"
    export function writeNumber(num: number, x: number, y: number) {
        writeText("" + num, x, y)
    }
}
