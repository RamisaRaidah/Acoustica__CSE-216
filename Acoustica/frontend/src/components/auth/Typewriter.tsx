import { useState, useEffect } from "react";
interface TypewriterProps {
  lines: string[];
}

export function Typewriter({ lines }: TypewriterProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  const [underlineWidth, setUnderlineWidth] = useState(0);

  useEffect(() => {
    if (typing) {
      if (charIndex < lines[lineIndex].length) {
        const timer = setTimeout(() => {
          setCharIndex(charIndex + 1);
        }, 70);
        return () => clearTimeout(timer);
      } else if (lineIndex < lines.length - 1) {
        const timer = setTimeout(() => {
          setLineIndex(lineIndex + 1);
          setCharIndex(0);
        }, 200);
        return () => clearTimeout(timer);
      } else {
        setUnderlineWidth(300);
        const timer = setTimeout(() => {
          setTyping(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else {
      // Erasing
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setCharIndex(charIndex - 1);
          setUnderlineWidth((charIndex - 1) / lines[lineIndex].length * 300);
        }, 40);
        return () => clearTimeout(timer);
      } else if (lineIndex > 0) {
        const timer = setTimeout(() => {
          setLineIndex(lineIndex - 1);
          setCharIndex(lines[lineIndex - 1].length);
        }, 200);
        return () => clearTimeout(timer);
      } else {
        setUnderlineWidth(0);
        const timer = setTimeout(() => {
          setTyping(true);
          setLineIndex(0);
          setCharIndex(0);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [lineIndex, charIndex, typing, lines]);

  const currentText = lines
    .slice(0, lineIndex)
    .concat([lines[lineIndex].slice(0, charIndex)])
    .join('\n');

  return (
    <>
      <p className="typewriter">{currentText}</p>
      <div className="auth-underline" style={{ width: `${underlineWidth}px` }} />
    </>
  );
}
