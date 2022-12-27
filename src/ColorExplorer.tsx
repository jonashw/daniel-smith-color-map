import React from 'react';
import ColorMap from './ColorMap';
import { Color, Colors } from './Color';
declare global {
    interface Window {
        colors: Colors;
        selectedColors: Set<Color>;
    }
}

function ColorExplorer({colors} : {colors: Colors}) {
  const [activeColor,setActiveColor] = React.useState<Color|undefined>(undefined);
  const [selectedColors,setSelectedColors] = React.useState<Set<Color>>(new Set<Color>());
  const [singlesOnly,setSinglesOnly] = React.useState<boolean>(false);
  const [onlyActiveNeighborhoodVisible, setOnlyActiveNeighborhoodVisible] = React.useState(false);

  const availableColors: Color[] = singlesOnly ? colors.all.filter(c => c.Pigments.length === 1) : colors.all;
  const toggleSelectedColor = (c: Color) => 
    setSelectedColors(
        selectedColors.has(c) 
        ? new Set(Array.from(selectedColors).filter(sc => sc !== c))
        : new Set([...Array.from(selectedColors), c]));
    window.colors=colors;
    window.selectedColors=selectedColors;

  let palletePigments = new Set(Array.from(selectedColors).flatMap(c => c.Pigments));
  let mixableColors = colors.all.filter(c => 
    !selectedColors.has(c) 
    && c.Pigments.length > 1 
    && Array.from(c.Pigments).every(p => palletePigments.has(p)))

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-3" style={{height:'100vh',overflowY:'auto'}}>
          {!!activeColor && <div>
            <h5>{activeColor?.Name}</h5>
            <table className="table table-bordered table-sm">
              <tbody>
                <tr>
                  <th>Pigment(s)</th>
                  <td>{activeColor!.Pigments.join(', ')}</td>
                </tr>
                <tr>
                  <th>Staining</th>
                  <td>{activeColor!.Staining}</td>
                </tr>
                <tr>
                  <th>Lightfastness</th>
                  <td>{activeColor!.Lightfastness}</td>
                </tr>
                <tr>
                  <th>Granulation</th>
                  <td>{activeColor!.Granulation}</td>
                </tr>
                <tr>
                  <th>Transparency</th>
                  <td>{activeColor!.Transparency}</td>
                </tr>
              </tbody>
            </table>
            <img src={activeColor.SwatchUrl} style={{height:'250px'}}/>
            {
                colors.thatHaveAConstituent(activeColor)
                .map(color => <div key={color.Name}>{color.Name}</div>)
            }
          </div>}
        </div>
        <div className="col-6">
          <div>
            <button onClick={() => setSinglesOnly(!singlesOnly)}>Singles Only</button>
          </div>
          <ColorMap 
            visibleColors={availableColors}
            colors={colors}
            {...{onlyActiveNeighborhoodVisible,activeColor,setActiveColor,selectedColors,toggleSelectedColor}}
          />
        </div>
        <div className="col-3" style={{height:'100vh',overflowY:'auto'}}>
            <div
                onMouseOver={() => setOnlyActiveNeighborhoodVisible(true)}
                onMouseOut={() => setOnlyActiveNeighborhoodVisible(false)}
            >
                {availableColors.map(c => 
                    <div
                    key={c.Name}
                    className={'px-2 ' + (c === activeColor || selectedColors.has(c) ? 'bg-primary text-white' : '')}
                    onMouseOver={() => setActiveColor(c)}
                    onClick={() => toggleSelectedColor(c)}
                    >
                    {c.Name}
                    </div>
                )}
          </div>
          <hr/>
          <h3>Your palette</h3>
          {Array.from(selectedColors).map(c =>
            <div
              key={c.Name}
              className={'px-2 ' + (c === activeColor ? 'bg-primary text-white' : '')}
              onMouseOver={() => setActiveColor(c)}
              onClick={() => toggleSelectedColor(c)}
            >
              {c.Name}
            </div>
          )}
          <h3>Mixable from your palete</h3>
          {mixableColors.map(c => 
            <div
              key={c.Name}
              className={'px-2 ' + (c === activeColor || selectedColors.has(c) ? 'bg-primary text-white' : '')}
              onMouseOver={() => setActiveColor(c)}
            >
              {c.Name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ColorExplorer;
