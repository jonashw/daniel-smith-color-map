import React from 'react';
import {  Color, Colors } from './Color';
import ColorExplorer from './ColorExplorer';

function App() {
  const [colors,setColors] = React.useState(Colors([]));

  React.useEffect(() => {
    const effect = async () => {
      let r = await fetch('/colors.json');
      let data: Color[] = await r.json() as Color[];
      setColors(Colors(data));
    };
    effect();
  }, []);

  return (
    <div className="App">
      {colors.all.length > 0 && <ColorExplorer colors={colors} />}
    </div>
  );
}

export default App;
