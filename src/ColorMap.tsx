//import Konva from 'konva';
import { Layer, Stage, Text, Line, Circle, Arrow} from 'react-konva';
import {Color,Colors} from './Color';
const scale = 4;

//new Konva.Text().measureSize()

const ColorLabel = ({color}:{color:Color}) =>
    <Text 
        key={color.Name}
        text={color.Name}
        x={color.Position.x + 2}
        y={color.Position.y - 2}
        stroke={'white'}
        strokeWidth={4/scale}
        fillAfterStrokeEnabled={true}
        fill={'black'}
        scaleY={-1}
        fontSize={3}
    />;

const ColorConnection = ({from,to}:{from:Color,to:Color}) => {
    /* For clarity, the arrowhead must fall short of the target of the connection.
    ** Without a shortening of the connecting line segment, the arrowhead will fall
    ** within the target circle and obscure its color. */

    let x1 = from.Position.x;
    let y1 = from.Position.y;
    let x2 = to.Position.x;
    let y2 = to.Position.y;
    let h = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
    let theta = Math.atan2(y2-y1, x2-x1);
    //console.log({h,theta,thetaDeg: theta*180/Math.PI, name:from.Name});
    let hb = h - 2*scale/3;
    let x2b = x1 + hb * Math.cos(theta);
    let y2b = y1 + hb * Math.sin(theta);
    return (
        <Arrow 
            key={'Arrow-' + from.Name + '-' + to.Name}
            stroke={'black'}
            strokeWidth={1/scale}
            fill={'black'}
            pointerLength={2}
            pointerWidth={2}
            points={[
                x1,  y1,
                x2b, y2b
            ]}
        />
    );
};


const ColorMap =({
    colors,
    visibleColors,
    onlyActiveNeighborhoodVisible,
    activeColor,
    setActiveColor,
    selectedColors,
    toggleSelectedColor
} : {
    colors: Colors,
    visibleColors: Color[],
    onlyActiveNeighborhoodVisible: boolean,
    activeColor: Color | undefined,
    setActiveColor: (c: Color | undefined) => void,
    selectedColors: Set<Color>,
    toggleSelectedColor: (c: Color) => void
}) => {

    const ColorCircle = ({
        color,
        selected,
        active
    } : {color:Color, selected: boolean, active: boolean}) => 
        <Circle 
            key={"Circle-" + color.Name}
            onMouseOver={() => {
                console.log(color.Name);
                setActiveColor(color);
            }}
            onClick={() => toggleSelectedColor(color) }
            onMouseOut={() => {
                //setActiveColor(undefined);
            }}
            x={color.Position.x}
            y={color.Position.y}
            radius={2}
            fill={`rgba(${color.RGBA})`}
            stroke={selected ? 'blue' : 'black'}
            strokeWidth={(active ? 3 : 1)/scale}
        />;


    const w = scale*(colors.bbox.xmax - colors.bbox.xmin) + 200;
    const h = scale*(colors.bbox.ymax - colors.bbox.ymin) + 50;
    return (
        <Stage 
            width={w}
            height={h}
            offsetX={-w/scale/2}
            offsetY={h/scale/1.6}
            scaleY={-scale}
            scaleX={scale}
        >
            <Layer>
                <Line
                    points={[0,-200,0,200]}
                    stroke={'black'}
                    strokeWidth={1/scale}
                />
                <Line
                    points={[-200,0,200,0]}
                    stroke={'black'}
                    strokeWidth={1/scale}
                />
                {!onlyActiveNeighborhoodVisible && visibleColors.map(c =>
                    <ColorCircle 
                        color={c}
                        active={c === activeColor}
                        selected={selectedColors.has(c)}/>
                )}
                {activeColor && 
                    <>
                    <ColorCircle color={activeColor} active={true} selected={false}/>
                    <ColorLabel color={activeColor} /> 
                    </>
                }
                {activeColor && 
                    colors.thatHaveAConstituent(activeColor)
                        .map(color => {
                            return <>
                                <ColorCircle color={color} active={true} selected={false}/>
                                <ColorConnection from={activeColor} to={color}/>
                                <ColorLabel color={color} />
                            </>;
                        })
                    }
                {activeColor && 
                    colors.thatAreConstituentsOf(activeColor)
                        .map(constituent => {
                            return <>
                                <ColorCircle color={constituent} active={true} selected={false}/>
                                <ColorConnection from={constituent} to={activeColor}/>
                                <ColorLabel color={constituent} />
                            </>;
                        })
                    }
            </Layer>
        </Stage>
    );
}

export default ColorMap;