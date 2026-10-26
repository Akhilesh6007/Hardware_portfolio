import { useId } from "react";
export default function TechnicalArt({
  kind = "arm",
  className = "",
}: {
  kind?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`technical-art ${className}`}
      viewBox="0 0 700 580"
      role="img"
      aria-label={`${kind === "arm" ? "Industrial robotic arm" : kind === "hand" ? "Robotic hand" : kind === "launcher" ? "Ball launcher" : "Autonomous rover"} concept illustration`}
    >
      <defs>
        <linearGradient id={`metal${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#73777a" />
          <stop offset=".3" stopColor="#34383b" />
          <stop offset=".7" stopColor="#101315" />
          <stop offset="1" stopColor="#45494a" />
        </linearGradient>
        <linearGradient id={`orange${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ff9b57" />
          <stop offset=".25" stopColor="#ff662b" />
          <stop offset=".7" stopColor="#b6310c" />
          <stop offset="1" stopColor="#641e0b" />
        </linearGradient>
        <radialGradient id={`glow${id}`}>
          <stop stopColor="#ff5a1f" stopOpacity=".18" />
          <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
        </radialGradient>
        <pattern
          id={`grid${id}`}
          width="44"
          height="44"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M44 0H0V44"
            fill="none"
            stroke="#ffffff"
            strokeOpacity=".045"
          />
        </pattern>
        <filter id={`shadow${id}`}>
          <feGaussianBlur stdDeviation="15" />
        </filter>
      </defs>
      <rect width="700" height="580" fill={`url(#grid${id})`} />
      <ellipse cx="380" cy="320" rx="310" ry="260" fill={`url(#glow${id})`} />
      <g fill="none" stroke="#6c5a4f" strokeWidth=".8" opacity=".45">
        <ellipse cx="350" cy="465" rx="240" ry="74" />
        <ellipse cx="350" cy="465" rx="280" ry="92" strokeDasharray="3 8" />
        <path d="M70 465H640M350 55V550M112 95V355M102 95H122M102 355H122" />
        <path d="M130 115H320L370 165M535 170H635V360" strokeDasharray="3 5" />
      </g>
      <ellipse
        cx="360"
        cy="478"
        rx="170"
        ry="28"
        fill="black"
        opacity=".8"
        filter={`url(#shadow${id})`}
      />
      {kind === "arm" ? (
        <g stroke="#17191a" strokeWidth="2">
          <path
            d="M250 440L363 410L478 453V482L360 521L250 476Z"
            fill={`url(#metal${id})`}
          />
          <path d="M250 440L363 410L478 453L360 489Z" fill="#515557" />
          <path d="M280 438L360 420L442 451L360 474Z" fill="#1c2021" />
          <path
            d="M305 393Q350 366 405 396V441Q352 468 305 439Z"
            fill={`url(#metal${id})`}
          />
          <ellipse cx="355" cy="393" rx="50" ry="20" fill="#727678" />
          <ellipse cx="355" cy="393" rx="34" ry="12" fill="#202526" />
          <path
            d="M318 398L280 280L322 252L372 382Z"
            fill={`url(#orange${id})`}
          />
          <path d="M322 252L343 270L389 390L372 407L372 382Z" fill="#8d2b0e" />
          <circle cx="309" cy="273" r="46" fill={`url(#metal${id})`} />
          <circle cx="309" cy="273" r="31" fill="#686b6d" />
          <circle cx="309" cy="273" r="22" fill="#262b2d" />
          <circle cx="309" cy="273" r="9" fill="#929698" />
          <path
            d="M306 235L420 133L456 175L344 279Z"
            fill={`url(#orange${id})`}
          />
          <path d="M344 279L361 278L473 179L456 175Z" fill="#72240e" />
          <path
            d="M331 239L414 163L425 173L342 249Z"
            fill="#ffb079"
            opacity=".45"
          />
          <circle cx="441" cy="153" r="41" fill={`url(#metal${id})`} />
          <circle cx="441" cy="153" r="29" fill="#616668" />
          <circle cx="441" cy="153" r="18" fill="#262b2e" />
          <path
            d="M464 143L513 184L489 216L445 180Z"
            fill={`url(#orange${id})`}
          />
          <path d="M513 184L527 187L501 220L489 216Z" fill="#a03410" />
          <ellipse
            cx="507"
            cy="205"
            rx="21"
            ry="14"
            transform="rotate(-48 507 205)"
            fill={`url(#metal${id})`}
          />
          <path
            d="M518 196L554 217L552 244L537 247L540 228L510 213Z"
            fill="#676c6e"
          />
          <path
            d="M498 213L519 247L509 265L497 259L502 248L485 224Z"
            fill="#51575a"
          />
          <path
            d="M552 244L559 260L548 266L537 247M509 265L513 276L502 280L497 259"
            fill="#262a2c"
          />
          <path
            d="M364 400Q410 380 366 290Q350 251 399 207L434 176"
            fill="none"
            stroke="#111416"
            strokeWidth="12"
          />
          <path
            d="M364 400Q410 380 366 290Q350 251 399 207L434 176"
            fill="none"
            stroke="#45494a"
            strokeWidth="4"
            strokeDasharray="3 5"
          />
          {[
            [280, 454],
            [360, 510],
            [454, 467],
            [311, 246],
            [286, 276],
            [320, 297],
            [421, 139],
            [461, 161],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#9b9fa1" />
              <path d={`M${x - 2} ${y}h4`} stroke="#222" strokeWidth="1" />
            </g>
          ))}
          <path d="M318 343L341 335L352 363L329 371Z" fill="#272725" />
          <text
            x="328"
            y="355"
            fill="#d3cec8"
            fontSize="8"
            transform="rotate(-18 328 355)"
            stroke="none"
          >
            BD—01
          </text>
        </g>
      ) : kind === "hand" ? (
        <g
          transform="translate(225 74) rotate(-12 120 220)"
          stroke="#1c2021"
          strokeWidth="3"
        >
          <path
            d="M50 250L200 250L205 365L145 407L65 366Z"
            fill={`url(#metal${id})`}
          />
          {[0, 1, 2, 3].map((n) => (
            <g
              key={n}
              transform={`translate(${53 + n * 39} ${n === 0 ? 30 : n === 3 ? 55 : 0})`}
            >
              <rect
                y="75"
                width="29"
                height="122"
                rx="13"
                fill={`url(#metal${id})`}
              />
              <rect
                y="85"
                x="5"
                width="19"
                height="43"
                rx="7"
                fill={`url(#orange${id})`}
              />
              <circle cx="14" cy="150" r="12" fill="#84878a" />
              <path
                d="M2 196L27 196L24 252L4 252Z"
                fill={`url(#orange${id})`}
              />
              <path d="M14 80V270" stroke="#252a2b" strokeWidth="3" />
            </g>
          ))}
          <path
            d="M45 278L-9 210L-33 222L-10 282L48 337"
            fill={`url(#orange${id})`}
          />
          <circle cx="4" cy="266" r="13" fill="#676d70" />
          <rect x="77" y="290" width="97" height="56" rx="5" fill="#303c38" />
          <path
            d="M87 301h76M87 312h76M87 323h45"
            stroke="#9ba891"
            strokeWidth="2"
          />
          <path d="M80 367L76 425H164L161 377" fill={`url(#orange${id})`} />
        </g>
      ) : kind === "launcher" ? (
        <g stroke="#242626" strokeWidth="3">
          <path
            d="M180 433L315 366L516 432L382 502Z"
            fill={`url(#metal${id})`}
          />
          <path
            d="M221 432V286L368 223L468 274V439M221 286L382 344L468 274M382 344V476"
            fill="none"
            stroke="#777c7e"
            strokeWidth="12"
          />
          <path
            d="M240 282L384 334L444 280L301 236Z"
            fill={`url(#orange${id})`}
          />
          <ellipse
            cx="321"
            cy="258"
            rx="44"
            ry="64"
            transform="rotate(-30 321 258)"
            fill="#121718"
            stroke="#595e60"
            strokeWidth="15"
          />
          <ellipse
            cx="399"
            cy="289"
            rx="44"
            ry="64"
            transform="rotate(-30 399 289)"
            fill="#111718"
            stroke="#595e60"
            strokeWidth="15"
          />
          <path
            d="M338 249L421 197"
            stroke="#f5f5f5"
            strokeDasharray="5 9"
            strokeWidth="2"
          />
          <circle cx="457" cy="166" r="38" fill={`url(#orange${id})`} />
          <path
            d="M423 150Q465 167 477 199M450 128Q425 170 481 185M423 180L490 148"
            fill="none"
            stroke="#723318"
            strokeWidth="2"
          />
          <path
            d="M205 416L225 426M388 480L408 470"
            stroke="#ff5a1f"
            strokeWidth="8"
          />
        </g>
      ) : (
        <g stroke="#171b1c" strokeWidth="3">
          <path
            d="M204 338L357 278L516 348L364 422Z"
            fill={`url(#orange${id})`}
          />
          <path d="M204 338V392L364 463V422Z" fill="#96320f" />
          <path d="M364 422L516 348V407L364 463Z" fill="#41494a" />
          {[
            [246, 407],
            [445, 426],
            [465, 340],
          ].map(([x, y], i) => (
            <g key={i}>
              <ellipse
                cx={x}
                cy={y}
                rx="40"
                ry="52"
                transform={`rotate(-20 ${x} ${y})`}
                fill="#15191a"
                stroke="#4e5557"
                strokeWidth="10"
              />
              <ellipse cx={x} cy={y} rx="18" ry="27" fill="#868a8c" />
            </g>
          ))}
          <path d="M300 337L360 314L420 342L358 369Z" fill="#1b4c42" />
          <path d="M313 335L358 320L397 340L356 356Z" fill="#3c7063" />
          <path d="M355 315V240" stroke="#7d8789" strokeWidth="9" />
          <path d="M316 238L359 221L398 240L354 261Z" fill="#515b5d" />
          <path d="M316 238V275L355 293V261Z" fill="#242b2d" />
          <path d="M355 261L398 240V274L355 293Z" fill="#7b8586" />
          <ellipse cx="370" cy="267" rx="10" ry="12" fill="#171c1e" />
          <ellipse cx="388" cy="260" rx="8" ry="11" fill="#171c1e" />
          <path
            d="M400 275L548 226M400 275L562 285"
            stroke="#ff5a1f"
            strokeDasharray="4 7"
            strokeWidth="1"
          />
        </g>
      )}
      <g fontFamily="monospace" fontSize="9" fill="#8d8782">
        <text x="73" y="80">
          FIG.{" "}
          {kind === "arm" ? "001 — ARTICULATED SYSTEM" : "002 — CONCEPT STUDY"}
        </text>
        <text x="500" y="520">
          NOT TO SCALE / CONCEPT
        </text>
        <text x="83" y="360" transform="rotate(-90 83 360)">
          EXPERIMENTAL ASSEMBLY
        </text>
      </g>
      <g stroke="#ff6b2b" strokeWidth="1" fill="none">
        <path d="M550 190H610V140M205 340H160V395" />
        <circle cx="550" cy="190" r="3" />
        <circle cx="205" cy="340" r="3" />
      </g>
    </svg>
  );
}
