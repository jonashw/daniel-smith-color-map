import { Color, Colors, Palette } from "./Color";

const ColorProfile = ({
    color,
    colors,
    setActiveColor,
    palettes,
    addPaletteColor,
    removePaletteColor
}: {
    color:Color,
    colors:Colors,
    setActiveColor: (c:Color) => void,
    palettes: Palette[],
    addPaletteColor: (p: Palette, c: Color) => void,
    removePaletteColor: (p: Palette, c: Color) => void
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
        {palettes.map(p => 
            <div>
                <button className="btn btn-primary" onClick={() => addPaletteColor(p,color)}>
                    Add to &quot;{p.name}&quot;
                </button>
            </div>
        )}
        {
            colors.thatHaveAConstituent(color)
                .map(color => 
                <div
                    onClick={() => setActiveColor(color)}
                    key={color.Name}
                >{color.Name}</div>)
        }
    </div>;


export default ColorProfile;