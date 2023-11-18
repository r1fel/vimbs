import { useEffect, useState } from 'react';

// track and log the number of renders of a component
function useRenderCounter(componentName) {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount((prevCount) => prevCount + 1);
    console.log(`${componentName} has rendered ${renderCount + 1} times.`);
  }, []);

  return renderCount;
}

export default useRenderCounter;
