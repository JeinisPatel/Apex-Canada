export const CIRCUITS = {
  /* The Harbour Circuit — the original sweeping grand-prix loop */
  harbour:{name:"Harbour Circuit", blurb:"The classic capital loop \u2014 fast, flowing, harbour-side.",
    land:"harbour", water:"harbour",
    ctrl:[
    [700,1500],[1500,1480],[2200,1430],[2520,1180],[2580,800],[2520,520],
    [1900,380],[1300,420],[950,640],[880,1000],[620,1280],[520,1600],
    [560,1980],[760,2120],[700,2360],[900,2520],[1280,2470],[1560,2560],
    [1760,2430],[2040,2520],[2380,2500],[2620,2300],[2700,2020],[2540,1880],
    [2180,1900],[1880,1820],[1560,1900],[1240,1830],[980,1920],[760,1760]
  ]},
  /* The Gorge Sprint — tighter, more technical: chicanes, hairpins, a twisty inland run */
  gorge:{name:"The Gorge", blurb:"Tight, technical, twisting along the Gorge waterway \u2014 a driver's track.",
    land:"gorge", water:"gorge",
    ctrl:[
    [820,1480],[1340,1420],[1620,1520],[1780,1340],[1660,1120],[1380,1080],
    [1500,860],[1880,800],[2020,1000],[2120,1320],[2060,1560],[2300,1720],
    [2480,1980],[2300,2420],[1960,2440],[1740,2180],[1860,1880],[1700,1760],
    [1500,1820],[1320,2040],[1380,2320],[1180,2480],[900,2440],[760,2220],
    [880,1960],[700,1820],[560,1600],[640,1360],[820,1480]
  ]},
  /* The Peninsula Run — the drive up to Sidney: long seafront straight, a sweep past the airport, rural bends */
  sidney:{name:"Peninsula Run", blurb:"The open drive up to Sidney \u2014 seafront straights past the airport and the ferries.",
    land:"sidney", water:"sidney",
    ctrl:[
    [640,2080],[1120,2200],[1640,2240],[2120,2200],[2460,2020],[2560,1680],
    [2420,1380],[2480,1060],[2600,760],[2460,470],[2080,400],[1680,460],
    [1560,760],[1700,1040],[1520,1260],[1160,1240],[940,1020],[1000,700],
    [860,460],[540,500],[420,820],[520,1160],[760,1380],[760,1700],[640,2080]
  ]},
  /* The Malahat Climb — a twisting mountain pass: switchbacks, technical esses, summit ridge over the inlet */
  malahat:{name:"The Malahat Climb", blurb:"A twisting mountain pass \u2014 switchbacks and esses climbing to a ridge high over Saanich Inlet.",
    land:"malahat", water:"malahat",
    ctrl:[
    [620,2320],[1140,2390],[1680,2360],[2100,2380],
    [2420,2240],[2560,1960],[2460,1720],
    [2580,1500],[2500,1280],[2620,1060],
    [2480,760],[2560,520],[2300,400],
    [1900,420],[1500,440],[1120,400],[760,460],
    [520,640],[440,940],
    [600,1220],[460,1480],[600,1740],
    [480,2020]
  ]},
  /* Cordova Bay — a fast, flowing seaside circuit: long seafront straights on Haro Strait, sweeping bends inland past the golf course and Mount Douglas */
  cordova:{name:"Cordova Bay", blurb:"A fast seaside sweep \u2014 long straights along Haro Strait, flowing bends past the golf links and Mount Douglas.",
    land:"cordova", water:"cordova",
    ctrl:[
    [2150,2800],[2200,2300],[2225,1790],[2220,1280],[2175,780],[2070,440],
    [1800,300],[1380,270],[980,330],
    [640,500],[400,850],
    [330,1290],[450,1670],[330,2060],
    [400,2470],[620,2770],
    [1000,2870],[1460,2830],[1880,2800],[2030,2710]
  ]},
  /* Calgary — Stampede Sprint: a downtown street loop along the Bow, past the Saddledome and Stampede grounds */
  stampede:{name:"Stampede Sprint", blurb:"A downtown street loop along the Bow \u2014 past the Saddledome and Stampede grounds, Calgary Tower inland, the Rockies on the horizon.",
    land:"calgary", water:"calgary",
    ctrl:[
    [1700,2120],[2200,2030],[2640,1860],[3200,1800],[3760,1580],
    [4120,1180],[4000,720],[3500,420],[2960,330],[2460,340],
    [1980,320],[1480,360],[1000,470],[520,620],[-40,760],
    [-560,920],[-1080,1120],[-1560,1420],[-1820,1820],[-1560,2180],
    [-1000,2280],[-440,2180],[120,2100],[640,2040],[1080,1920],
    [1420,2040],[1600,2110]
  ]},
  /* Toronto — Exhibition Street Circuit: the lakeshore loop around Exhibition Place, Honda-Indy style */
  exhibition:{name:"Exhibition Street Circuit", blurb:"The lakeshore street circuit around Exhibition Place \u2014 a long Lake Shore straight, tight grounds corners, CN Tower and Rogers Centre on the skyline, Lake Ontario to the south.",
    land:"toronto", water:"toronto",
    ctrl:[
    [620,1750],[900,2080],[1450,2260],[2150,2290],[2850,2230],
    [3550,2090],[4150,1850],[4600,1480],[4750,950],[4520,460],
    [4000,180],[3350,130],[2650,210],[1950,360],[1400,540],
    [950,760],[680,1150],[600,1480]
  ]},
  /* Banff — a scenic Bow Valley loop ringed by the Rockies, the Banff Springs above the river */
  banff:{name:"Bow Valley Circuit", blurb:"A scenic mountain loop through the Bow Valley \u2014 Banff Avenue, the pines, and the Banff Springs Hotel, the Rockies on every side.",
    land:"banff", water:"banff",
    ctrl:[
    [1400,2200],[1850,2150],[2200,1980],[2380,1660],[2300,1320],
    [2420,1000],[2260,700],[1880,560],[1460,540],[1060,620],
    [760,820],[560,1140],[640,1480],[520,1800],[760,2060],
    [1080,2180]
  ]}
};

export const DEFAULT_CIRCUIT_ID = 'harbour';
