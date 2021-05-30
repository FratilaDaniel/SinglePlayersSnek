function BoardCell(props){
    const rotationClass = "rotationNeeded" + props.rotationNeeded;
    console.log(rotationClass)
    return (
        <td>
            <img 
                className={"imgtop " + rotationClass} 
                alt="" src={props.primaryImage}
                />
            <img alt="" src={props.backgroundImage}/>
        </td>
    );
}

export default BoardCell;
