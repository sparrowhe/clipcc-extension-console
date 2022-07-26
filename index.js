const { Extension, type, api } = require('clipcc-extension');

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

class Console extends Extension {

    constructor(terminal) {
        super();
        this.handleDone = this.handleDone.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleCommand = this.handleCommand.bind(this);
        this.terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
        });
        this.newCommand = false;
        this.hasReported = false;
        this.newCommandStr = "";
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
                                <path d="M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 6L18 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
            document.addEventListener("mousemove", this.handleMove);
            document.addEventListener("mouseup", this.handleDone);
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
                this.handleCommand(curr_line);
                this.terminal.prompt();
                curr_line = '';
            } else if (domEvent.key === 'Backspace') {
                curr_line = curr_line.substring(0, curr_line.length - 1);
                this.terminal.write('\b \b');
            } else {
                if (domEvent.key.length === 1) {
                    curr_line += key;
                    this.terminal.write(key)
                }
            }
        })

        this.terminal.open(document.getElementById("sparrow-console-body"))
        this.terminal.writeln('Hello from ClipCC Console!');
        this.terminal.prompt();

        api.addCategory({
            categoryId: 'top.sparrowhe.console.category',
            messageId: 'top.sparrowhe.console.category',
            color: '#66CCFF'
        });
        api.addBlock({
            opcode: 'top.sparrowhe.console.open',
            type: type.BlockType.COMMAND,
            messageId: 'top.sparrowhe.console.open',
            categoryId: 'top.sparrowhe.console.category',
            function: () => {
                // this.terminal.open(document.getElementById("sparrow-console-body"));
                // document.getElementById("sparrow-console").style = "";
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
                            value: COLORS.COLOR_NORMAL
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_green',
                            value: COLORS.COLOR_GREEN
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_yellow',
                            value: COLORS.COLOR_YELLOW
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_red',
                            value: COLORS.COLOR_RED
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_grey',
                            value: COLORS.COLOR_GREY
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_magenta',
                            value: COLORS.COLOR_MAGENTA
                        },
                        {
                            messageId: 'top.sparrowhe.console.color_cyan',
                            value: COLORS.COLOR_CYAN
                        }
                    ],
                    defaultValue: COLORS.COLOR_NORMAL
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
                this.terminal.write(`\x1b1K\x1b[3D\x1b[3D\x1b[3D${args.COLOR}${args.TEXT}${COLORS.COLOR_NORMAL}`);
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
            this.terminal.writeln('help: Display help text');
            this.terminal.writeln('clear: Clear the console');
            this.terminal.writeln('exec <command>: Execute a command');
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
        } else {
            this.terminal.writeln(`Unknown command: ${command}`);
            this.terminal.writeln(`Type "help" for a list of commands.`);
        }
    }
    handleMove(element) {
        let container = document.getElementById("sparrow-console");
        let e = window.getComputedStyle(container);
        container.style.left = "".concat(parseInt(e.left) + element.movementX, "px"),
        container.style.top = "".concat(parseInt(e.top) + element.movementY, "px")
    }
    handleDone() {
        document.removeEventListener("mousemove", this.handleMove);
        document.removeEventListener("mouseup", this.handleDone);
    }
}

module.exports = Console;
