export type ConnectionSettings = {incoming: boolean;  outgoing: boolean; }

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

export type Palette = {
    name: string;
    colors: Color[];
};

export type BBox = {xmin:number; xmax:number; ymin:number; ymax:number;};

export type Colors = {
    bbox: BBox;
    byPigment: {[pigment: string]: Color[]};
    byName: {[name: string]: Color};
    singlePigmentColorNames: {[pigment: string]: string};
    singlePigmentColors: {[pigment: string]: Color};
    singlePigmentColorNamesFixed: {[pigment: string]: string[]};
    singlePigmentColorsFixed: {[pigment: string]: Color[]};
    all: Color[];
    withPigmentSets: {color: Color; pigmentSet: Set<string>}[];
    thatHaveAConstituent: (c: Color) => Color[];
    thatAreConstituentsOf: (product: Color) => Color[];
    pigments: string[];
}

export const processColors = (colors: Color[]): Colors => {
    colors.sort((a,b) => a.Name > b.Name ? 1 : a.Name < b.Name ? -1 : 0);
    const byName = Object.fromEntries(colors.map(c => [c.Name, c]));

    const byPigment: {[pigment: string]: Color[]} = 
        colors
        .reduce((colorsByPigment,c) => {
            for(let p of c.Pigments){
                colorsByPigment[p] = colorsByPigment[p] || [];
                colorsByPigment[p].push(c);
            }
            return colorsByPigment;
        }, {} as {[pigment: string]: Color[]});

    const singlePigmentColorsFixed: {[pigment:string]: Color[]} = 
        colors
        .filter(c => c.Pigments.length === 1)
        .reduce((byPigment,c) => {
            let p = c.Pigments[0];
            byPigment[p] = byPigment[p] || [];
            byPigment[p].push(c);
            return byPigment;
        },{} as {[pigment:string]: Color[]});

    const singlePigmentColorNamesFixed: {[pigment:string]: string[]} = 
        colors
        .filter(c => c.Pigments.length === 1)
        .reduce((byPigment,c) => {
            let p = c.Pigments[0];
            byPigment[p] = byPigment[p] || [];
            byPigment[p].push(c.Name);
            return byPigment;
        },{} as {[pigment:string]: string[]});

    const singlePigmentColors = Object.fromEntries(
        colors
        .filter(c => (c.Pigments || []).length === 1)
        .map(c => [
            (c.Pigments || [])[0],
            c
        ]));

    const singlePigmentColorNames = Object.fromEntries(
        colors
        .filter(c => (c.Pigments || []).length === 1)
        .map(c => [
            (c.Pigments || [])[0],
            c.Name
        ]));

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
            constituent.Pigments.length > 0 
            && constituent.Pigments.every(p => pigmentSet.has(p))
            && color !== constituent)
        .map(({color}) => color);

    const thatAreConstituentsOf = (product: Color): Color[] =>
        product.Pigments.length === 1 
        ? []
        : product.Pigments
            .map(p => byName[singlePigmentColorNames[p]])
            .filter(otherC => !!otherC);
    
    const pigmentNameRegex = /^P/;

    return {
        bbox,
        byName,
        byPigment,
        singlePigmentColorNames,
        singlePigmentColors,
        singlePigmentColorNamesFixed,
        singlePigmentColorsFixed,
        withPigmentSets,
        all: colors,
        thatHaveAConstituent,
        thatAreConstituentsOf,
        pigments: Object.keys(byPigment).filter(p => pigmentNameRegex.test(p)).sort()
    };
};