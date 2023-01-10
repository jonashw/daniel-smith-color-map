import React from 'react';
import ColorMap from './ColorMap';
import { Color, Colors, ConnectionSettings } from './Color';
declare global {
    interface Window {
        colors: Colors;
        selectedColors: Set<Color>;
    }
}

const ColorProfile = ({
    color,
    colors,
    setActiveColor
}: {
    color:Color,
    colors:Colors,
    setActiveColor: (c:Color) => void
}) =>
    <div>
        <h5>{color.Name}</h5>
        <table className="table table-bordered table-sm">
            <tbody>
                <tr>
                    <th>Pigment(s)</th>
                    <td>{color.Pigments.map(p =>
                        <div key={p}>
                            {color.Pigments.length > 1 && p in colors.singlePigmentColors
                                ? <div onClick={() => setActiveColor(colors.singlePigmentColors[p])}>
                                    {p} ({colors.singlePigmentColors[p].Name})
                                </div>
                                : p}
                        </div>
                    )}</td>
                </tr>
                <tr>
                    <th>Staining</th>
                    <td>{color.Staining}</td>
                </tr>
                <tr>
                    <th>Lightfastness</th>
                    <td>{color.Lightfastness}</td>
                </tr>
                <tr>
                    <th>Granulation</th>
                    <td>{color.Granulation}</td>
                </tr>
                <tr>
                    <th>Transparency</th>
                    <td>{color.Transparency}</td>
                </tr>
                <tr>
                    <th>Series</th>
                    <td>{color.Series}</td>
                </tr>
            </tbody>
        </table>
        <img src={color.SwatchUrl} className="d-none d-sm-inline" style={{ height: '250px' }} alt={"Swatch of " + color.Name} />
        <img src={color.SwatchUrl} className="d-inline d-sm-none" alt={"Swatch of " + color.Name} />
        {
            colors.thatHaveAConstituent(color)
                .map(color => 
                <div
                    onClick={() => setActiveColor(color)}
                    key={color.Name}
                >{color.Name}</div>)
        }
    </div>;

function ColorExplorer({colors} : {colors: Colors}) {
  const [activeColor,setActiveColor] = React.useState<Color|undefined>(undefined);
  const [selectedColors,setSelectedColors] = React.useState<Set<Color>>(new Set<Color>());
  const [singlesOnly,setSinglesOnly] = React.useState<boolean>(false);
  const [onlyActiveNeighborhoodVisible, setOnlyActiveNeighborhoodVisible] = React.useState(false);
  const [connectionsVisible, setConnectionsVisible] = React.useState<ConnectionSettings>({incoming:true,outgoing:true});
  const [colorProfilePopupOpen,setColorProfilePopupOpen] = React.useState(false);
  const [viewPalette, setViewPalette] = React.useState(false);

  const [colorKeyword,setColorKeyword] = React.useState('');
  const [activePigment,setActivePigment] = React.useState<undefined|string>(undefined);
  const availableColors: Color[] = 
  (() => {
    let a = 
        (!!activePigment && activePigment in colors.byPigment ? colors.byPigment[activePigment] : colors.all)
        .filter(c => !singlesOnly || c.Pigments.length === 1);
    let kw = colorKeyword?.trim()?.toLowerCase() || '';
    return kw.length > 0
        ? a.filter(c => c.Name.toLowerCase().indexOf(kw) > -1)
        : a;
  })();
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
      <div className={"row " + (!colorProfilePopupOpen ? "d-none" : "d-flex")}>
        <div className="col-12 py-3">
            <button type="button"
                className="btn-close float-end"
                aria-label="Close"
                onClick={() => setColorProfilePopupOpen(false)}
            />
            {activeColor && <ColorProfile colors={colors} color={activeColor} setActiveColor={setActiveColor} />}
        </div>
      </div>
      <div className={"row " + (colorProfilePopupOpen ? "d-none" : "d-flex")}>
        <div className="col-3 d-none d-sm-flex" style={{height:'100vh',overflowY:'auto'}}>
          {!!activeColor && <ColorProfile color={activeColor} colors={colors} setActiveColor={setActiveColor} />}
        </div>
        <div className="col-12 col-sm-6">
          <div>
            <button onClick={() => setSinglesOnly(!singlesOnly)}>Singles Only</button>
            {viewPalette && <button onClick={() => setViewPalette(false)}>View all colors</button>}
            {([
                ['Incoming',connectionsVisible.incoming, v => setConnectionsVisible({...connectionsVisible, incoming: v})],
                ['Outgoing',connectionsVisible.outgoing, v => setConnectionsVisible({...connectionsVisible, outgoing: v})]
            ] as [string,boolean,(v:boolean) => void][]).map(([label,visible,setter]) =>
                <div>
                <label>
                    <input type="checkbox" defaultChecked={visible} onChange={e => setter(e.target.checked)}/>
                    {" "}
                    {label} connections visible
                </label>
                </div>
            )}
          </div>
          <ColorMap 
            visibleColors={viewPalette ? Array.from(selectedColors) : availableColors}
            colors={colors}
            {...{
                connectionsVisible,
                onlyActiveNeighborhoodVisible,
                setColorProfilePopupOpen,
                activeColor,
                setActiveColor,
                selectedColors,
                toggleSelectedColor
            }}
          />
        </div>
        <div className="col-12 col-sm-3" style={{height:'100vh',overflowY:'auto'}}>
            <input type="search" className="form-control"
                value={colorKeyword}
                placeholder="Search colors by name..."
                onChange={e => {
                    setColorKeyword(e.target.value);
                    e.preventDefault();
                }}
            />
            <div
                onMouseOver={() => setOnlyActiveNeighborhoodVisible(true)}
                onMouseOut={() => setOnlyActiveNeighborhoodVisible(false)}
            >
                {availableColors.map(c => 
                    <div
                    key={c.Name}
                    className={'d-flex px-2 ' + (c === activeColor || selectedColors.has(c) ? 'bg-primary text-white' : '')}
                    onMouseOver={() => setActiveColor(c)}
                    onClick={() => toggleSelectedColor(c)}
                    >
                        <span style={{
                            display:'inline-block',
                            width:'1em',
                            height:'1em',
                            alignSelf:'center',
                            background: `rgba(${c.RGBA})`,
                            border: '1px solid black',
                            borderRadius:'50%',
                            marginRight: '0.5em'
                        }}/>
                        {c.Name}
                    </div>
                )}
            <hr/>
            <h3>Your palette ({selectedColors.size})</h3>
            <button onClick={() => setViewPalette(true)} disabled={viewPalette}>View on map</button>
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
            <h3>By Pigment</h3>
            {colors.pigments.map(p => 
                <div 
                    onMouseOver={() => setActivePigment(p)}
                    onMouseOut={() => setActivePigment(undefined)}
                >
                    {p} ({(colors.byPigment[p] || []).length})
                    <div>
                        {colors.byPigment[p].filter(c => !singlesOnly || c.Pigments.length === 1).map(c =>
                            <div
                                style={{paddingLeft:'1em'}} 
                                onMouseOver={() => setActiveColor(c)}
                            >
                                {c.Name}
                            </div>
                        )}
                    </div>
                </div>
            )}
            </div>
          </div>
      </div>
    </div>
  );
}

export default ColorExplorer;
