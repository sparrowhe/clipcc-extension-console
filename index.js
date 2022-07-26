const { Extension, type, api } = require('clipcc-extension');

const { Terminal } = require('xterm');

require('xterm/css/xterm.css');
require('./index.css');

const COLORS = {
    COLOR_NORMAL: '\033[0m',
    COLOR_GREEN: '\033[1;32m',
    COLOR_YELLOW: '\033[1;33m',
    COLOR_RED: '\033[1;33m',
    COLOR_GREY: '\033[1;30m',
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
        element.style.overflow="hidden";
        element.innerHTML = `
            <div class="sparrow-console" id="sparrow-console" style="display: none;">
                <div class="sparrow-console-header" id="sparrow-console-header">
                    <div class="sparrow-console-header-title">
                        <span class="sparrow-console-header-title-text">ClipCC Console</span>
                    </div>
                </div>
                <div class="sparrow-console-body" id="sparrow-console-body">
                </div>
            </div>
        `;
        document.body.append(element);

        let curr_line = '';

        let headerElement = document.getElementById('sparrow-console-header');

        headerElement.addEventListener("mousedown", () => {
            document.addEventListener("mousemove", this.handleMove);
            document.addEventListener("mouseup", this.handleDone);
        })

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
                curr_line += key;
                this.terminal.write(key)
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
                        }
                    ],
                    defaultValue: COLORS.COLOR_NORMAL
                },
                TEXT: {
                    type: type.ParameterType.STRING,
                    defaultValue: 'Hello World!'
                }
            },
            function: (args) => {
                this.terminal.writeln(``);
                this.terminal.write(`${args.COLOR}${args.TEXT}${COLORS.COLOR_NORMAL}`);
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
                return command_str;
            }
        });
    }
    handleCommand(command) {
        if (command.trim() === 'help') {
            this.terminal.writeln('help: Display help text');
            this.terminal.writeln('clear: Clear the console');
            this.terminal.writeln('exec <command>: Execute a command');
        } else if (command.trim() === 'clear') {
            this.terminal.clear();
        } else if (command.trim().startsWith('exec')) {
            const command_str = command.trim().substring(4).trim();
            this.newCommand = true;
            this.newCommandStr = command_str;
            this.terminal.writeln(`Executing: ${command_str}`);
            // eval(command_str);
        } else {
            this.terminal.writeln(`Unknown command: ${command}`);
        }
    }
    handleMove(element) {
        let container = document.getElementById("sparrow-console");
        let e = window.getComputedStyle(container);
        container.style.left = "".concat(parseInt(e.left) + element.movementX, "px"),
        container.style.top = "".concat(parseInt(e.top) + element.movementY, "px")
    }
    handleDone(element) {
        document.removeEventListener("mousemove", this.handleMove);
        document.removeEventListener("mouseup", this.handleDone);
    }
}

module.exports = Console;
