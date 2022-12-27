export type Color = {
    Name:  string;
    SwatchUrl: string;
    SKU: string;
    RGBA: string;
    Lightfastness: string;
    Staining:  string;
    Granulation: string;
    Transparency: string;
    Position: {
        x: number;
        y: number;
    };
    Pigments: string[];
    Series: number;
};

export type BBox = {xmin:number; xmax:number; ymin:number; ymax:number;};

export type Colors = {
    bbox: BBox;
    byPigment: {[pigment: string]: string[]};
    byName: {[name: string]: Color};
    singlePigmentColors: {[pigment: string]: string};
    all: Color[];
    withPigmentSets: {color: Color; pigmentSet: Set<string>}[];
    thatHaveAConstituent: (c: Color) => Color[];
    thatAreConstituentsOf: (product: Color) => Color[];
}

export const Colors = (colors: Color[]): Colors => {
    colors.sort((a,b) => a.Name > b.Name ? 1 : a.Name < b.Name ? -1 : 0);
    const byName = Object.fromEntries(colors.map(c => [c.Name, c]));

    const byPigment: {[pigment: string]: string[]} = 
        colors
        .flatMap(c => (c.Pigments || []).map(p => [p,c.Name]))
        .reduce((colorsByPigment,[p,c]) => {
            colorsByPigment[p] = colorsByPigment[p] || [];
            colorsByPigment[p].push(c);
            return colorsByPigment;
        }, {} as {[pigment: string]: string[]});

    const singlePigmentColors = Object.fromEntries(
        colors
        .filter(c => (c.Pigments || []).length === 1)
        .map(c => [
            (c.Pigments || [])[0],
            c.Name
        ]));

    const mixes = 
        Object.fromEntries(
            colors
            .filter(c => (c.Pigments || []).length > 1)
            .map(c => [
            c.Name,
            (c.Pigments || []).map(p => [p, singlePigmentColors[p]])
            ])
        );

    const withPigmentSets = colors.map(c => ({color: c, pigmentSet: new Set(c.Pigments)}));

    const bbox = {xmin:0,xmax:0,ymin:0,ymax:0};
    for(let c of colors){
        bbox.xmin = Math.min(bbox.xmin, c.Position.x);
        bbox.xmax = Math.max(bbox.xmax, c.Position.x);
        bbox.ymin = Math.min(bbox.ymin, c.Position.y);
        bbox.ymax = Math.max(bbox.ymax, c.Position.y);
    }

    const thatHaveAConstituent = (constituent: Color) =>
        withPigmentSets.filter(({pigmentSet,color}) => 
            constituent.Pigments.every(p => pigmentSet.has(p))
            && color !== constituent)
        .map(({color}) => color);

    const thatAreConstituentsOf = (product: Color): Color[] =>
        product.Pigments.length === 1 
        ? []
        : product.Pigments
            .map(p => byName[singlePigmentColors[p]])
            .filter(otherC => !!otherC);

    return {
        bbox,
        byName,
        byPigment,
        singlePigmentColors,
        withPigmentSets,
        all: colors,
        thatHaveAConstituent,
        thatAreConstituentsOf
    };
};