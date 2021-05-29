import React from "react";
import settings from "../config";
import BoardCell from "./BoardCell";
import grassImage from "../resources/grass.jpg";
import SnakeHeadImage from "../resources/Snake_Head.svg";
import SnakeBodyImage from "../resources/Snake_Body.svg";
import SnakeTurnImage from "../resources/Snake_Turn.svg";
import SnakeTailImage from "../resources/Snake_Tail.svg";


class Board extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            rows: settings.BOARD_ROWS,
            cols: settings.BOARD_COLS,
            values: [],
        }
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
        this.setState({values: initialValues});
    }
    
    logCurrentBoardState(){
        console.log("---------------");
        console.log(this.state.rows);
        console.log(this.state.cols);
        console.log(this.state.values);
    }

    render(){
        return(
            <table>
                <tbody>
                {
                    this.state.values.map((row) => {
                        return (
                            <tr>
                            {
                                row.map((cell, index) => {    
                                let imageSource = "";
                                switch(cell){
                                    case settings.SNEK_HEAD_CELL_VALUE: imageSource = SnakeHeadImage; break; // rotate if needed
                                    case settings.SNEK_BODY_CELL_VALUE: imageSource = SnakeBodyImage; break;
                                    case settings.SNEK_TURN_CELL_VALUE: imageSource = SnakeTurnImage; break;
                                    case settings.SNEK_TAIL_CELL_VALUE: imageSource = SnakeTailImage; break;
                                    default: imageSource = grassImage; break;
                                }
                                    return <BoardCell key={index} imageSource={imageSource}/>;
                                })
                            }
                            </tr>)
                    })
                }
                </tbody>
            </table>
        );
    }   
}

export default Board;
