import React from 'react';
import ColorMap from './ColorMap';
import { Color, Colors, ConnectionSettings, Palette } from './Color';
import ColorProfile from './ColorProfile';
//import {CreateFacetedIndex} from 'simple-faceted-search-engine-in-JavaScript/src/model/CreateFacetedIndex';
//import { FacetedIndexInstance, Query, RecordWithMetadata, SearchResult } from 'simple-faceted-search-engine-in-JavaScript/src/model/types';
//import SearchFilters from 'simple-faceted-search-engine-in-JavaScript/src/components/SearchFilters';

declare global {
    interface Window {
        colors: Colors;
        selectedColors: Set<Color>;
    }
}

function ColorExplorer({colors} : {colors: Colors}) {
  const [palettes,setPalettes] = React.useState<Palette[]>([]);
  const [activePaletteNum,setActivePaletteNum] = React.useState<number|undefined>();
  const activePalette = activePaletteNum === undefined ? undefined : palettes[activePaletteNum];
  const createNewPalette = () => {
    let name = prompt('What is the new palette\'s name?','Palette #' + (palettes.length+1));
    if(!name){
        alert('invalid name');
        return;
    }
    setPalettes([...palettes, {name, colors:[]}])
  };

  const removePaletteColor = (palette: Palette, color: Color) => {
    let newPalettes = palettes.map(p => p != palette ? p : {name:p.name, colors: p.colors.filter(c => c != color) });
    setPalettes(newPalettes);
  };

  const addPaletteColor = (palette: Palette, color: Color) => {
    let newPalettes = palettes.map(p => p != palette ? p : {name:p.name, colors: [...p.colors, color]});
    setPalettes(newPalettes);
  };
  /*
  const [ix,setIx] = React.useState<FacetedIndexInstance|undefined>(undefined);
  const [query,setQuery] = React.useState<Query>({});
  const [searchResult,setSearchResult] = React.useState<SearchResult|undefined>(undefined);

  React.useEffect(() => {
    let ix = CreateFacetedIndex(colors.all, {
        fields: {
            display: new Set<string>(),
            facet: new Set<string>([
                'Pigments',
                'Series',
                'Lightfastness',
                'Staining',
                'Granulation',
                'Transparency'
            ])
        },
        facet_term_parents: {}
    });
    setIx(ix);
  }, [colors]);

  React.useEffect(() => {
    if(!ix){
        return;
    }
    if(!query){
        return;
    }
    setSearchResult(ix.search(query));
  }, [ix, query]);
  */

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
        <div className="row">
            <div className="col-3">
                <div className="list-group">
                    {palettes.map((p,i) => 
                        <div className="list-group-item">
                            <a className="list-group-link"
                                style={{cursor:'pointer'}}
                                onClick={() => setActivePaletteNum(i)}
                            >
                                {p.name}
                            </a>
                            <div className="text-muted text-sm">
                                {p.colors.length} colors
                            </div>
                        </div>
                    )}
                    <div className="list-group-item">
                        <button className="btn btn-block btn-primary" onClick={() => createNewPalette()}>
                            New Palette
                        </button>
                    </div>
                </div>
            </div>
            {activePalette && 
                <div className="col-9">
                    <h3>{activePalette.name}</h3>
                    <div className="row">
                        {activePalette.colors.map(c => 
                            <div className="col-1" onClick={() => {
                                if(window.confirm('Remove from palette?')){
                                    removePaletteColor(activePalette,c);
                                }
                            }}>
                                <img src={c.SwatchUrl} alt={c.Name} className="img-fluid"/>
                                <br/>
                                <div className="text-sm" style={{fontSize:'0.5em'}}>
                                    {c.Name}
                                </div>
                            </div>
                        )}
                    </div>
                    <ColorMap 
                        visibleColors={activePalette.colors}
                        onlyActiveNeighborhoodVisible={false}
                        colors={colors}
                        connectionsVisible={{
                            incoming: false,
                            outgoing: false
                        }}
                        {...{
                            setColorProfilePopupOpen,
                            activeColor,
                            setActiveColor,
                            selectedColors,
                            toggleSelectedColor
                        }}
                    />

                </div>
            }
        </div>

      {/*!!searchResult && 
        <div className="row">
            <div className="col-3">
                <SearchFilters
                    query={query}
                    setQuery={setQuery}
                    debug={false}
                    searchResult={searchResult}
                    term_is_selected={(f,t) => f in query && query[f].indexOf(t) > -1}
                />
            </div>
            <div className="col-9">
                {searchResult.records.length}
            </div>
        </div>
      */}
      <div className={"row " + (!colorProfilePopupOpen ? "d-none" : "d-flex")}>
        <div className="col-12 py-3">
            <button type="button"
                className="btn-close float-end"
                aria-label="Close"
                onClick={() => setColorProfilePopupOpen(false)}
            />
            {activeColor && <ColorProfile colors={colors} color={activeColor} setActiveColor={setActiveColor}
                {...{palettes,addPaletteColor,removePaletteColor}}    />}
        </div>
      </div>
      <div className={"row " + (colorProfilePopupOpen ? "d-none" : "d-flex")}>
        <div className="col-3 d-none d-sm-flex" style={{height:'100vh',overflowY:'auto'}}>
          {!!activeColor && 
            <ColorProfile color={activeColor} colors={colors} setActiveColor={setActiveColor} 
                {...{palettes,addPaletteColor,removePaletteColor}}
            />}
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
      <div className="row">
        {availableColors.map(c => 
            <div
            key={c.Name}
            className={'col-1 '+ (c === activeColor || selectedColors.has(c) ? 'bg-primary text-white' : '')}
            onMouseOver={() => setActiveColor(c)}
            onClick={() => toggleSelectedColor(c)}
            >
                <img src={c.SwatchUrl} className="img-fluid" title={c.Name} alt={c.Name}/>
            </div>
        )}
        </div>
    </div>
  );
}

export default ColorExplorer;
