import React from "react";
import settings from "../config";
import BoardCell from "./BoardCell";
import grassImage from "../resources/grass.jpg";
import SnakeHeadImage from "../resources/Snake_Head.svg";
import SnakeBodyImage from "../resources/Snake_Body.svg";
import SnakeTurnImage from "../resources/Snake_Turn.svg";
import SnakeTailImage from "../resources/Snake_Tail.svg";
import AppleImage from "../resources/apple.png";


class Board extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            rows: settings.BOARD_ROWS,
            cols: settings.BOARD_COLS,
            values: [],
            snek: [{
                part: settings.SNEK_HEAD_CELL_VALUE,
                row: 3,
                col: 3,
                orientation: 0 // 0 default, 1 - 3 rotate clockwise 90 degrees
            },
            {
                part: settings.SNEK_BODY_CELL_VALUE,
                row: 4,
                col: 3,
                orientation: 0
            },
            {
                part: settings.SNEK_TURN_CELL_VALUE,
                row: 5,
                col: 3,
                orientation: 0 // up - right
            },
            {
                part: settings.SNEK_BODY_CELL_VALUE,
                row: 5,
                col: 4,
                orientation: 1 // left - right
            },
            {
                part: settings.SNEK_BODY_CELL_VALUE,
                row: 5,
                col: 5,
                orientation: 1 // left - right
            },
            {
                part: settings.SNEK_TAIL_CELL_VALUE,
                row: 5,
                col: 6,
                orientation: 0 // left - right
            },
            ],
            apple: {
                row: 1,
                col: 1,
            },
            isDead: false,
            gameWon: false
        }
        // bind wasd
        this.handleUserInput = this.onUserInput.bind(this);
    }

    onUserInput(event){
        // get user input
        // check if snek in bounds with new coordinates
        // move snek if in bounds
        const keyPressed = event.key.toLowerCase();
        this.moveSnek(keyPressed);
    }

    // check if user gave as input the opposite of head direction
    checkInvalidUserInput(direction){
        return (Math.abs(direction - this.state.snek[0].orientation) === 2)
    }

    checkSnekOutOfBounds(nextSnekHeadRow, nextSnekHeadCol){
        return (nextSnekHeadRow < 0 || nextSnekHeadCol < 0 
            || nextSnekHeadRow >= this.state.rows || nextSnekHeadCol >= this.state.cols);
    }

    checkSnekHitsBody(nextSnekHeadRow, nextSnekHeadCol){
        let snekHitsHimself = false;
        // last segment disappears, does not count
        for(let segmentIndex = 0; segmentIndex < this.state.snek.length - 1; segmentIndex++){
            if(nextSnekHeadRow === this.state.snek[segmentIndex].row 
                && nextSnekHeadCol === this.state.snek[segmentIndex].col){
                    snekHitsHimself = true;
                    break;
                }
        }
        return snekHitsHimself;
    }

    moveSnek(direction){
        // compute new head position based on input
        // attach new head
        // remove old tail
        let [movingCoordinatesRow, movingCoordinatesCol] = [];
        let headOrientation = 0;
        switch(direction){
            case settings.USER_INPUT_UP: 
                [movingCoordinatesRow, movingCoordinatesCol] = [-1, 0]; 
                headOrientation = 0;
                break;
            case settings.USER_INPUT_LEFT: 
                [movingCoordinatesRow, movingCoordinatesCol] = [0, -1]; 
                headOrientation = 3;
                break;
            case settings.USER_INPUT_DOWN: 
                [movingCoordinatesRow, movingCoordinatesCol] = [1, 0]; 
                headOrientation = 2;
                break;
            
            case settings.USER_INPUT_RIGHT: 
                [movingCoordinatesRow, movingCoordinatesCol] = [0, 1]; 
                headOrientation = 1;
                break;
            default: /* invalid input, ignore*/ break;
        }
        let invalidUserInput = this.checkInvalidUserInput(headOrientation);
        if(invalidUserInput){
            return;
        }


        
        let newSnekCoords = [...this.state.snek];
        let newSegment = {...newSnekCoords[0]};
        let newBoardValues = [...this.state.values];
        newSegment.row += movingCoordinatesRow;
        newSegment.col += movingCoordinatesCol;
        if(!this.snekGotApple(newSegment.row, newSegment.col)){
            // apple not eaten, move the whole snake
            const removedTail = newSnekCoords.pop();
            newBoardValues[removedTail.row][removedTail.col] = settings.EMPTY_CELL_VALUE;
        }
        else{
            // apple eaten, move just the head
            this.getNextAppleCoords();
            if(!this.state.gameWon){
                newBoardValues[this.state.apple.row][this.state.apple.col] = settings.APPLE_CELL_VALUE;
            }
        }
        
        newSnekCoords = [newSegment, ...newSnekCoords];
        let isOutOfBounds = this.checkSnekOutOfBounds(newSegment.row, newSegment.col);
        let snekBitesSelf = this.checkSnekHitsBody(newSegment.row, newSegment.col);

        this.setState({snek: newSnekCoords});

        this.computeSnekOrientationAndParts(headOrientation);

        

        let startSegment = 0;
        if(isOutOfBounds){
            this.setState({isDead: true}); 
            startSegment = 1;
            this.setState({snek: newSnekCoords});
        }
        else if(snekBitesSelf){
            for(let i = 1; i < this.state.snek.length; i++){
                if(this.state.snek[i].row === this.state.snek[0].row &&
                    this.state.snek[i].col === this.state.snek[0].col){
                        newSnekCoords[i].part = settings.SNEK_HEAD_CELL_VALUE;
                        this.setState({snek: newSnekCoords});
                        break;
                }
            }
            this.setState({isDead: true}); 
        }
        
        for(let segmentIndex = startSegment; segmentIndex < this.state.snek.length; segmentIndex++){
            const segment = this.state.snek[segmentIndex];
            newBoardValues[segment.row][segment.col] = segment.part;
        }
        this.setState({values: newBoardValues});
        if(this.state.gameWon){
            document.removeEventListener("keypress", this.handleUserInput);
            return;
        }
        if(this.state.isDead){
            document.removeEventListener("keypress", this.handleUserInput);
            return;
        }

    }

    snekGotApple(newHeadRow, newHeadCol){
        return newHeadRow === this.state.apple.row && newHeadCol === this.state.apple.col;
    }

    getNextAppleCoords(){
        // some bug here
        const availableSlots = this.state.rows * this.state.cols - this.state.snek.length - 1
        if(availableSlots === 0){
            this.setState({apple: {row: -1, col:-1}, gameWon: true});
        }
        let randomNumber = Math.floor(Math.random() * availableSlots);
        for(let i = 0; i < this.state.rows; i++){
            for(let j = 0; j < this.state.cols; j++){
                if(this.state.values[i][j] === settings.EMPTY_CELL_VALUE){
                    randomNumber--;
                    if(randomNumber <= 0){
                        const newApple = {row: i, col: j};
                        this.setState({apple: newApple});
                        console.log(this.state.apple);
                        return;
                    }
                }
                else{
                    
                }
            }
        }
    }

    computeSnekOrientationAndParts(headOrientation){
        let newSnek = [...this.state.snek];
        const snekLength = newSnek.length;
        // first segment is head, orientation given by user input
        newSnek[0].orientation = headOrientation;
        // second to (second to last) segments  
        for(let segmentIndex = 1; segmentIndex < snekLength - 1; segmentIndex++){
            // if previous and next segment are on the same row/col part is simple BODY, else L TURN
            if(newSnek[segmentIndex - 1].row === newSnek[segmentIndex + 1].row){
                // horizontal BODY
                newSnek[segmentIndex].part = settings.SNEK_BODY_CELL_VALUE;
                newSnek[segmentIndex].orientation = 1;
            }
            else if (newSnek[segmentIndex - 1].col === newSnek[segmentIndex + 1].col){
                // vertical BODY
                newSnek[segmentIndex].part = settings.SNEK_BODY_CELL_VALUE;
                newSnek[segmentIndex].orientation = 0;  
            }     
            else{
                // part is TURN
                newSnek[segmentIndex].part = settings.SNEK_TURN_CELL_VALUE;
                let orientation = 0;
                const A = newSnek[segmentIndex - 1], B = newSnek[segmentIndex], C = newSnek[segmentIndex + 1];
                if(A.row === B.row){
                    if(A.col < B.col){
                        if(B.row > C.row){
                            orientation = 3;
                        }
                        else{
                            orientation = 2;
                        }
                    }
                    else{
                        if(B.row > C.row){
                            orientation = 0;
                        }
                        else{
                            orientation = 1;
                        }
                    }
                }
                else{ // C.row === B.row
                    if(C.col < B.col){
                        if(B.row > A.row){
                            orientation = 3;
                        }
                        else{
                            orientation = 2;
                        }
                    }
                    else{
                        if(B.row > A.row){
                            orientation = 0;
                        }
                        else{
                            orientation = 1;
                        }
                    }
                }
                newSnek[segmentIndex].orientation = orientation;
            }
        }

        // last segemnt is tail, orientation given by previous segment
        // if previous segment is TURN then tail has same orientation, else orientation + 1
        newSnek[snekLength - 1].part = settings.SNEK_TAIL_CELL_VALUE;
        if(newSnek[snekLength - 2].row < newSnek[snekLength - 1].row){
            newSnek[snekLength - 1].orientation = 1;
        }
        else if (newSnek[snekLength - 2].row > newSnek[snekLength - 1].row){
            newSnek[snekLength - 1].orientation = 3;
        }
        else if(newSnek[snekLength - 2].col > newSnek[snekLength - 1].col){
            newSnek[snekLength - 1].orientation = 2;
        }
        else {
            newSnek[snekLength - 1].orientation = 0;
        }
        this.setState({snek: newSnek});
    }
    
    componentDidMount(){
        this.initializeBoardValues();
    }
    
    initializeBoardValues(){
        this.setState({values: []});
        const initialValues = [];
        for(let rowIndex = 0; rowIndex < this.state.rows; rowIndex++){
            const currentRow = [];
            for(let colIndex = 0; colIndex < this.state.cols; colIndex++){
                currentRow.push(settings.EMPTY_CELL_VALUE);
            }
            initialValues.push(currentRow);
        }
        this.state.snek.forEach((segment) => {
            initialValues[segment.row][segment.col] = segment.part;
        });
        initialValues[this.state.apple.row][this.state.apple.col] = settings.APPLE_CELL_VALUE;
        this.setState({values: initialValues});
    }

    render(){
        document.addEventListener("keypress", this.handleUserInput);
        return(
            <div>
                <table>
                    <tbody>
                    {
                        this.state.values.map((row, rowIndex) => {
                            return (
                                <tr>
                                {
                                    row.map((cell, colIndex) => {    
                                    let primaryImage, secondaryImage = grassImage;
                                    let rotationNeededInDegrees = 0;
                                    for(let i = 0; i < this.state.snek.length; i++){
                                        if(this.state.snek[i].row === rowIndex && this.state.snek[i].col === colIndex){
                                            rotationNeededInDegrees = this.state.snek[i].orientation * 90;
                                            break;
                                        }
                                    }
                                    
                                    switch(cell){
                                        case settings.SNEK_HEAD_CELL_VALUE: primaryImage = SnakeHeadImage; break; // rotate if needed
                                        case settings.SNEK_BODY_CELL_VALUE: primaryImage = SnakeBodyImage; break;
                                        case settings.SNEK_TURN_CELL_VALUE: primaryImage = SnakeTurnImage; break;
                                        case settings.SNEK_TAIL_CELL_VALUE: primaryImage = SnakeTailImage; break;
                                        case settings.APPLE_CELL_VALUE: primaryImage = AppleImage; secondaryImage = AppleImage; break;
                                        default: [primaryImage, secondaryImage] = [grassImage, null]; break;
                                    }
                                        return <BoardCell 
                                            key={colIndex} 
                                            primaryImage={primaryImage} 
                                            backgroundImage={secondaryImage}
                                            rotationNeeded={rotationNeededInDegrees}
                                            />;
                                    })
                                }
                                </tr>)
                        })
                    }
                    </tbody>
                </table>
                {this.state.isDead ? <h1> YOU DIED! </h1> : null}
                {this.state.gameWon ? <h1> YOU WON THE GAME, cheater! </h1> : null}
            </div>
        );
    }   
}

export default Board;
