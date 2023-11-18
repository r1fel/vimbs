import { useRef } from 'react';
import { logger } from './logger';

const RenderCounter = (componentName: string) => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  logger.log(`${componentName} re-rendered ${renderCount.current} times.`);

  return renderCount.current;
};

export default RenderCounter;
