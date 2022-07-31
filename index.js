const { Extension, type, api } = require('clipcc-extension');
const { FitAddon } = require('xterm-addon-fit')
const { Terminal } = require('xterm');

require('xterm/css/xterm.css');
require('./index.css');

const COLORS = {
    COLOR_NORMAL: '\x1b[0m',
    COLOR_GREEN: '\x1b[1;32m',
    COLOR_YELLOW: '\x1b[1;33m',
    COLOR_RED: '\x1b[1;31m',
    COLOR_MAGENTA: '\x1b[1;35m',
    COLOR_CYAN: '\x1b[1;36m',
    COLOR_GREY: '\x1b[1;30m',
}

const COLOR_NAME = {
    NORMAL: 'normal',
    GREEN: 'green',
    YELLOW: 'yellow',
    RED: 'red',
    MAGENTA: 'magenta',
    CYAN: 'cyan',
    GREY: 'grey',
}

class Console extends Extension {

    constructor(terminal) {
        super();
        this.handleDoneMouse = this.handleDoneMouse.bind(this);
        this.handleDoneTouch = this.handleDoneTouch.bind(this);
        this.handleMoveMouse = this.handleMoveMouse.bind(this);
        this.handleMoveTouch = this.handleMoveTouch.bind(this);
        this.handleCommand = this.handleCommand.bind(this);
        this.terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            theme: {
                background: '#424242',
                selection: '#BDBDBD'
            }
        });
        this.newCommand = false;
        this.hasReported = false;
        this.newCommandStr = "";
        this.moveLock = null;
        this.fitAddon = new FitAddon();
        this.previousTouch = null;
        this.terminal.loadAddon(this.fitAddon);
    }

    onInit() {
        if (document.getElementById('sparrow-console') === null) {
            // 删除之前的
            const oldConsole = document.getElementById('sparrow-console');
            if (oldConsole) {
                oldConsole.remove();
            }
        }
        let element = document.createElement("div");
        element.style.overflow = 'hidden';
        element.id = 'sparrow-console-main-container';
        element.innerHTML = `
            <div class="sparrow-console" id="sparrow-console" style="display: none;">
                <div class="sparrow-console-header" id="sparrow-console-header" style="display: flex; align-items: center">
                    <div class="sparrow-console-header-title" style="width: 100%">
                        <span class="sparrow-console-header-title-text">ClipCC Console</span>
                    </div>
                    <div class="sparrow-console-header-close" id="sparrow-console-header-close" style="width: 15px; height: 15px;">
                        <div class="sparrow-console-header-close-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="#EEEEEE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 6L18 18" stroke="#EEEEEE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="sparrow-console-body" id="sparrow-console-body">
                </div>
            </div>
        `;
        document.body.append(element);

        let curr_line = '';

        let headerElement = document.getElementById('sparrow-console-header');
        let closeButton = document.getElementById('sparrow-console-header-close');
        headerElement.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", this.handleMoveMouse);
            document.addEventListener("mouseup", this.handleDoneMouse);
        });
        headerElement.addEventListener("touchstart", () => {
            document.addEventListener("touchmove", this.handleMoveTouch);
            document.addEventListener("touchend", this.handleDoneTouch);
        });
        closeButton.addEventListener("click", () => {
            document.getElementById('sparrow-console').style.display = 'none';
        });

        this.terminal.prompt = () => {
            this.terminal.write("\r\n>>> ");
        };
        // 接受输入
        this.terminal.onKey(({ key, domEvent }) => {
            if (domEvent.key === 'Enter') {
                this.terminal.writeln('');
                if (curr_line.length > 0) {
                    this.handleCommand(curr_line);
                    this.terminal.prompt();
                    curr_line = '';
                } else {
                    this.terminal.prompt();
                }
                // this.handleCommand(curr_line);
                // this.terminal.prompt();
                // curr_line = '';
            } else if (domEvent.key === 'Backspace') {
                if (curr_line.length < 1) return;
                curr_line = curr_line.substring(0, curr_line.length - 1);
                this.terminal.write('\b \b');
            } else {
                if (domEvent.key.length === 1) {
                    curr_line += key;
                    this.terminal.write(key)
                }
            }
        })

        this.terminal.open(document.getElementById("sparrow-console-body"));
        setTimeout(() => { this.fitAddon.fit(); }, 100);
        this.terminal.writeln('Hello from ClipCC Console!');
        this.terminal.prompt();

        api.addCategory({
            categoryId: 'top.sparrowhe.console.category',
            messageId: 'top.sparrowhe.console.category',
            color: '#66CCFF'
        });

        // api.addBlock({
        //     opcode: 'top.sparrowhe.console.help',
        //     type: 6,
        //     messageId: 'top.sparrowhe.console.help',
        //     categoryId: 'top.sparrowhe.console.category',
        //     function: () => {
        //         console.log("Hello");
        //     }
        // });

        api.addBlock({
            opcode: 'top.sparrowhe.console.open',
            type: type.BlockType.COMMAND,
            messageId: 'top.sparrowhe.console.open',
            categoryId: 'top.sparrowhe.console.category',
            function: () => {
                // this.terminal.open(document.getElementById("sparrow-console-body"));
                // document.getElementById("sparrow-console").style = "";
                // 800x400以下不给开
                if (window.innerWidth < 800 || window.innerHeight < 400) {
                    return;
                }
                document.getElementById("sparrow-console").style = "";
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.console.close',
            type: type.BlockType.COMMAND,
            messageId: 'top.sparrowhe.console.close',
            categoryId: 'top.sparrowhe.console.category',
            function: () => {
                // this.terminal.c();
                document.getElementById("sparrow-console").style = "display: none;";
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.console.clear',
            type: type.BlockType.COMMAND,
            messageId: 'top.sparrowhe.console.clear',
            categoryId: 'top.sparrowhe.console.category',
            function: () => {
                this.terminal.clear();
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.console.output_log',
            type: type.BlockType.COMMAND,
            messageId: 'top.sparrowhe.console.output_log',
            categoryId: 'top.sparrowhe.console.category',
            param: {
                COLOR: {
                    type: type.ParameterType.STRING,
                    menu: [
                        {
                            messageId: 'top.sparrowhe.console.color_normal',
                            value: COLOR_NAME.NORMAL
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_green',
                            value: COLOR_NAME.GREEN
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_yellow',
                            value: COLOR_NAME.YELLOW
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_red',
                            value: COLOR_NAME.RED
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_grey',
                            value: COLOR_NAME.GREY
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_magenta',
                            value: COLOR_NAME.MAGENTA
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_cyan',
                            value: COLOR_NAME.CYAN
                        }
                    ],
                    defaultValue: COLOR_NAME.NORMAL
                },
                TEXT: {
                    type: type.ParameterType.STRING,
                    defaultValue: 'Hello'
                }
            },
            function: (args) => {
                // let lines = this.terminal.;
                // lines = lines.split('\n');
                // let lastLine = lines[lines.length - 1];
                // if (lastLine.startsWith('>>> ')) {
                //     this.terminal.write(`\x1b[2K\r`);
                // }
                // console.log(lines);
                // this.terminal.writeln('');
                let color = COLORS.COLOR_NORMAL;
                switch (args.COLOR) {
                    case COLOR_NAME.NORMAL:
                        color = COLORS.COLOR_NORMAL;
                        break;
                    case COLOR_NAME.GREEN:
                        color = COLORS.COLOR_GREEN;
                        break;
                    case COLOR_NAME.YELLOW:
                        color = COLORS.COLOR_YELLOW;
                        break;
                    case COLOR_NAME.RED:
                        color = COLORS.COLOR_RED;
                        break;
                    case COLOR_NAME.GREY:
                        color = COLORS.COLOR_GREY;
                        break;
                    case COLOR_NAME.MAGENTA:
                        color = COLORS.COLOR_MAGENTA;
                        break;
                    case COLOR_NAME.CYAN:
                        color = COLORS.COLOR_CYAN;
                        break;
                }
                this.terminal.write(`\x1b1\x1b[3D\x1b[3D\x1b[3D${color}${args.TEXT}${COLORS.COLOR_NORMAL}`);
                this.terminal.prompt();
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.console.execute',
            type: type.BlockType.HAT,
            messageId: 'top.sparrowhe.console.execute',
            categoryId: 'top.sparrowhe.console.category',
            function: (args) => {
                if(!!this.hasReported) {
                    this.hasReported = false;
                    return false;
                }
                if (this.newCommand) {
                    this.newCommand = false;
                    this.hasReported = true;
                    return true;
                }
                return false;
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.console.command',
            type: type.BlockType.REPORTER,
            messageId: 'top.sparrowhe.console.command',
            categoryId: 'top.sparrowhe.console.category',
            function: (args) => {
                return this.newCommandStr;
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.console.is_open',
            type: type.BlockType.REPORTER,
            messageId: 'top.sparrowhe.console.is_open',
            categoryId: 'top.sparrowhe.console.category',
            function: (args) => {
                if (document.getElementById("sparrow-console").style.display === 'none') {
                    return false;
                } else {
                    return true;
                }
            }
        })
    }
    onUninit() {
        // 删除 sparrow-console-main-contariner
        let element = document.getElementById('sparrow-console-main-container');
        element.remove();
        api.removeCategory('top.sparrowhe.console.category');
        api.removeBlocks([
            'top.sparrowhe.console.open',
            'top.sparrowhe.console.close',
            'top.sparrowhe.console.clear',
            'top.sparrowhe.console.output_log',
            'top.sparrowhe.console.execute',
            'top.sparrowhe.console.command'
        ]);
    }
    handleCommand(command) {
        if (command.trim() === 'help') {
            this.terminal.writeln('help\t Display help text');
            this.terminal.writeln('clear\t Clear the console');
            this.terminal.writeln('exec <command>\t Execute a command');
            this.terminal.writeln('');
            this.terminal.writeln('\tThis Console Has Super Cow Power.');
        } else if (command.trim() === 'moo') {
            this.terminal.writeln('              (__)');
            this.terminal.writeln('              (oo)');
            this.terminal.writeln('        /------\/');
            this.terminal.writeln('       / |    ||');
            this.terminal.writeln('      *  /\\---/\\');
            this.terminal.writeln('         ~~   ~~');
            this.terminal.writeln('..."Have you mooed today?"...');
        } else if (command.trim() === 'clear') {
            this.terminal.clear();
        } else if (command.trim().startsWith('exec')) {
            if (command.trim().split(' ').length <= 1) {
                this.terminal.writeln('Not enough arguments, check help text to see how to use this command');
                return;
            }
            const command_str = command.trim().substring(4).trim();
            this.newCommand = true;
            this.newCommandStr = command_str;
            this.terminal.writeln(`Executing: ${command_str}`);
            // eval(command_str);
        } else if (command.trim() === '') {
            this.terminal.prompt();
        } else {
            this.terminal.writeln(`Unknown command: ${command}`);
            this.terminal.writeln(`Type "help" for a list of commands.`);
        }
    }
    handleMoveMouse(element) {
        if(this.moveLock == 'touch') return;
        this.moveLock = 'mouse';
        document.getSelection().removeAllRanges();
        let container = document.getElementById("sparrow-console");
        let e = window.getComputedStyle(container);
        container.style.left = "".concat(parseInt(e.left) + element.movementX, "px")
        container.style.top = "".concat(parseInt(e.top) + element.movementY, "px")
    }
    handleMoveTouch(element) {
        if(this.moveLock == 'mouse') return;
        this.moveLock = 'touch';
        let container = document.getElementById("sparrow-console");
        let e = window.getComputedStyle(container);
        let touch = element.targetTouches[0];
        if(this.previousTouch){
            let movementX = touch.pageX - this.previousTouch.pageX;
            let movementY = touch.pageY - this.previousTouch.pageY;
            container.style.left = "".concat(parseInt(e.left) + movementX, "px")
            container.style.top = "".concat(parseInt(e.top) + movementY, "px")
        }
        this.previousTouch = element.targetTouches[0];
    }
    handleDoneMouse() {
        document.removeEventListener("mousemove", this.handleMoveMouse);
        document.removeEventListener("mouseup", this.handleDoneMouse);
        this.moveLock = null;
    }
    handleDoneTouch(){
        document.removeEventListener("touchmove", this.handleMoveTouch);
        document.removeEventListener("touchend", this.handleDoneTouch);
        this.moveLock = null;
        this.previousTouch = null;
    }
}

module.exports = Console;
