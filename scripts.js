const vowels     = "a|i|o|u".split     ( "|" )
const softs      = "m|n|l|w".split     ( "|" )
const nonsofts   = "b|d|k|zh|f|y".split( "|" )
const consonants = [ ...softs, ...nonsofts ]
const letters    = [ ...vowels, ...consonants ]

const templates  = {
    "C"   : String.fromCodePoint( 0xf1000 ),
    "v"   : String.fromCodePoint( 0xf1001 ),
   "Cv"   : String.fromCodePoint( 0xf1002 ),
  "CCv"   : String.fromCodePoint( 0xf1003 ),
    "vC"  : String.fromCodePoint( 0xf1004 ),
   "CvC"  : String.fromCodePoint( 0xf1005 ),
  "CCvC"  : String.fromCodePoint( 0xf1006 ),
    "vW"  : String.fromCodePoint( 0xf1007 ),
   "CvW"  : String.fromCodePoint( 0xf1008 ),
  "CCvW"  : String.fromCodePoint( 0xf1009 ),
    "vWC" : String.fromCodePoint( 0xf100A ),
   "CvWC" : String.fromCodePoint( 0xf100B ),
  "CCvWC" : String.fromCodePoint( 0xf100C )
}

const _ = null

const pattern = {
    "v"   : [ _, _, 0, _, _ ],
   "Cv"   : [ _, 0, 0, _, _ ],
  "CCv"   : [ 0, 2, 0, _, _ ],
    "vC"  : [ _, _, 0, 0, _ ],
   "CvC"  : [ _, 0, 1, 1, _ ],
  "CCvC"  : [ 2, 3, 1, 0, _ ],
    "vW"  : [ _, _, 0, 2, _ ],
   "CvW"  : [ _, 0, 1, 2, _ ],
  "CCvW"  : [ 2, 3, 1, 4, _ ],
    "vWC" : [ _, _, 0, 2, 0 ],
   "CvWC" : [ _, 0, 1, 2, 3 ],
  "CCvWC" : [ 2, 3, 1, 4, 5 ]
}

const code = {
  "a"  : 0xf2000,
  "i"  : 0xf2010,
  "u"  : 0xf2020,
  "o"  : 0xf2030,
  "m"  : 0xf2040,
  "n"  : 0xf2050,
  "l"  : 0xf2060,
  "w"  : 0xf2070,
  "b"  : 0xf2080,
  "d"  : 0xf2090,
  "k"  : 0xf20a0,
  "zh" : 0xf20b0,
  "f"  : 0xf20c0,
  "y"  : 0xf20d0
}

function update( txt ) {
  document.getElementById( "translation-output" ).value = translate( txt )
}

function translate( txt ) {
  txt = txt.toLowerCase( )
  let tokens = [ ]
  for ( let i = 0; i < txt.length; i++ ) {
    let idx = letters.indexOf( txt[ i ] )
    if ( idx === -1 ) {
      if ( txt.substring( i, i + 2 ) === "zh" ) {
        tokens.push( { str: "zh", vowel: false, closestVowel: null } )
        i++
        continue
      }
      return ""
    }
    let vowel = vowels.includes( txt[ i ] )
    let closestVowel = vowel ? 0 : null
    tokens.push( { str: txt[ i ], vowel, closestVowel } )
  }
  for ( let i = 0; i < tokens.length; i++ ) {
    if ( tokens[ i ].vowel ) continue
    if ( tokens[ i - 1 ]?.vowel ) {
      tokens[ i ].closestVowel = -1
      continue
    }
    if ( tokens[ i + 1 ]?.vowel ) {
      tokens[ i ].closestVowel = 1
      continue
    }
    if ( tokens[ i - 2 ]?.vowel ) {
      tokens[ i ].closestVowel = -2
      continue
    }
    if ( tokens[ i + 2 ]?.vowel ) {
      tokens[ i ].closestVowel = 2
      continue
    }
  }
  let syllables = [ ], currentSyllable = { index: null }
  for ( let i = 0; i < tokens.length; i++ ) {
    if ( tokens[ i ].closestVowel === null ) {
      currentSyllable = { index: i, type: "C", value: tokens[ i ].str }
      continue
    }
    if ( currentSyllable.index !== tokens[ i ].closestVowel + i ) {
      if ( currentSyllable.index !== null ) syllables.push( currentSyllable )
      currentSyllable = { index: tokens[ i ].closestVowel + i, values: { } }
    }
    currentSyllable.values[ tokens[ i ].closestVowel ] = tokens[ i ].str
  }
  if ( currentSyllable.index !== null ) syllables.push( currentSyllable )
  for ( let i = 0; i < syllables.length; i++ ) {
    if ( syllables[ i ].type === "C" ) continue
    let s = syllables[ i ]
    s.type = ( s.values[ 2 ] ? "C" : "" )
           + ( s.values[ 1 ] ? "C" : "" )
           + "v"
           + ( s.values[ -1 ] ? ( softs.includes( s.values[ -1 ] ) ? "W" : "C" ) : "" )
           + ( s.values[ -2 ] ? "C" : "" )
  }
  let blocks = [ ]
  for ( let i = 0; i < syllables.length; i++ ) {
    let s = syllables[ i ]
    if ( s.type === "C" ) {
      blocks.push( templates[ "C" ] + String.fromCodePoint( code[ s.value ] ) )
    } else {
      let b = templates[ s.type ]
      if ( s.values[  2 ] ) b += String.fromCodePoint( code[ s.values[  2 ] ] + pattern[ s.type ][ 0 ] )
      if ( s.values[  1 ] ) b += String.fromCodePoint( code[ s.values[  1 ] ] + pattern[ s.type ][ 1 ] )
      if ( s.values[  0 ] ) b += String.fromCodePoint( code[ s.values[  0 ] ] + pattern[ s.type ][ 2 ] )
      if ( s.values[ -1 ] ) b += String.fromCodePoint( code[ s.values[ -1 ] ] + pattern[ s.type ][ 3 ] )
      if ( s.values[ -2 ] ) b += String.fromCodePoint( code[ s.values[ -2 ] ] + pattern[ s.type ][ 4 ] )
      blocks.push( b )
    }
  }
  return blocks.reverse( ).join( "" )
}