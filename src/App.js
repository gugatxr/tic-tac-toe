/** @jsxImportSource @emotion/react */
import "./App.css";
import React from "react";
import { motion } from "framer-motion";

export default function App() {
  return (
    <div css={{ padding: "1rem 3rem", maxWidth: "400px", margin: "auto" }}>
      <header>
        <h1>Jogo da Velha React</h1>
      </header>
      <Game />
    </div>
  );
}

const clone = (x) => JSON.parse(JSON.stringify(x));

function generateGrid(rows, columns, mapper) {
  return Array(rows)
    .fill()
    .map(() => Array(columns).fill().map(mapper));
}

const newTicTacToeGrid = () => generateGrid(3, 3, () => null);

function checkThree(a, b, c) {
  if (!a || !b || !c) return false;

  return a === b && b === c;
}

const flatten = (array) => array.reduce((acc, cur) => [...acc, ...cur], []);

function checkForWin(flatGrid) {
  const [nw, n, ne, w, c, e, sw, s, se] = flatGrid;

  return (
    checkThree(nw, n, ne) ||
    checkThree(w, c, e) ||
    checkThree(sw, s, se) ||
    checkThree(nw, w, sw) ||
    checkThree(n, c, s) ||
    checkThree(ne, e, se) ||
    checkThree(nw, c, se) ||
    checkThree(ne, c, sw)
  );
}

function checkForDraw(flatGrid) {
  return (
    !checkForWin(flatGrid) &&
    flatGrid.filter(Boolean).length === flatGrid.length
  );
}

const getInitialState = () => ({
  grid: newTicTacToeGrid(),
  turn: "X",
  state: "inProggress",
});

const NEXT_TURN = {
  X: "O",
  O: "X",
};

const reducer = (state, action) => {
  if (state.status === "success" && action.type !== "RESET") {
    return state;
  }

  switch (action.type) {
    case "RESET": {
      return getInitialState();
    }
    case "CLICK": {
      const { x, y } = action.payload;
      const { grid, turn } = state;

      if (grid[y][x]) {
        return state;
      }

      const nextState = clone(state);

      nextState.grid[y][x] = turn;
      const flatGrid = flatten(nextState.grid);

      if (checkForWin(flatGrid)) {
        nextState.status = "success";
        return nextState;
      }

      if (checkForDraw(flatGrid)) {
        return getInitialState();
      }

      nextState.turn = NEXT_TURN[turn];

      return nextState;
    }

    default:
      return state;
  }
};

function Game() {
  const [state, dispatch] = React.useReducer(reducer, getInitialState());
  const { grid, status, turn } = state;

  const handleClick = (x, y) => {
    dispatch({ type: "CLICK", payload: { x, y } });
  };

  const reset = () => dispatch({ type: "RESET" });

  return (
    <div
      css={{
        display: "inline-block",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div css={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          Próximo a jogar: <span css={{ fontWeight: "bold" }}>{turn}</span>
        </div>
        <button type="button" onClick={reset}>
          resetar
        </button>
      </div>
      <h1 css={{ textAlign: "center" }}>
        {status === "success" ? `${turn} venceu!` : null}
      </h1>

      <Grid grid={grid} handleClick={handleClick} />
    </div>
  );
}

function Grid({ grid, handleClick }) {
  return (
    <div css={{ display: "inline-block", width: "100%", marginTop: "1rem" }}>
      <div
        css={{
          backgroundColor: "#444",
          display: "grid",
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          gridGap: 2,
          width: "100%",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <Cell
              key={`${colIndex}-${rowIndex}`}
              value={value}
              x={colIndex}
              y={rowIndex}
              onClick={() => handleClick(colIndex, rowIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => {
    // const delay = 1 + i * 0.5;
    const delay = 0;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

function X() {
  return (
    <motion.svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      initial="hidden"
      animate="visible"
    >
      <motion.line
        x1="10"
        y1="10"
        x2="60"
        y2="60"
        stroke="#00cc88"
        variants={draw}
        custom={2}
      />
      <motion.line
        x1="60"
        y1="10"
        x2="10"
        y2="60"
        stroke="#00cc88"
        variants={draw}
        custom={2.5}
      />
    </motion.svg>
  );
}
function O() {
  return (
    <motion.svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="35"
        cy="35"
        r="30"
        stroke="#ff0055"
        variants={draw}
        custom={1}
      />
    </motion.svg>
  );
}

function Cell({ onClick, value, x, y }) {
  return (
    <div css={{ backgroundColor: "#fff", width: "100%", height: 100 }}>
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, width: "0%", height: "0" }}
        animate={{ opacity: 1, width: "100%", height: "100%" }}
        transition={{ delay: 0.2 * y * x }}
        css={{ backgroundColor: "#fff", border: "none" }}
      >
        {value === "O" ? <O /> : null}
        {value === "X" ? <X /> : null}
      </motion.button>
    </div>
  );
}
