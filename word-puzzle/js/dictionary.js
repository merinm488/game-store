/**
 * Word Puzzle Dictionary
 * Common English words (3-7 letters) for gameplay
 */

const DICTIONARY = new Set([
    // 3-letter words
    "ace","act","add","age","ago","aid","aim","air","all","and","ant","any","ape","arc","are","ark","arm","art","ash","ask","ate",
    "bad","bag","ban","bar","bat","bay","bed","bee","bet","big","bin","bit","bow","box","boy","bud","bug","bus","but","buy",
    "cab","can","cap","car","cat","cop","cow","cry","cub","cup","cut",
    "dad","dam","day","den","dew","did","die","dig","dim","dip","dog","dot","dry","dub","dud","due","dug","dye",
    "ear","eat","egg","ego","elm","end","era","eve","eye",
    "fad","fan","far","fat","fax","fed","fee","few","fig","fin","fir","fit","fix","fly","foe","fog","for","fox","fry","fun","fur",
    "gag","gap","gas","gay","gel","gem","get","gig","gin","god","got","gum","gun","gut","guy","gym",
    "had","ham","has","hat","hay","hem","hen","her","hid","him","hip","his","hit","hog","hop","hot","how","hub","hue","hug","hum","hut",
    "ice","icy","ill","imp","ink","inn","ion","ire","irk","its","ivy",
    "jab","jag","jam","jar","jaw","jay","jet","jig","job","jog","jot","joy","jug","jut",
    "keg","ken","key","kid","kin","kit",
    "lab","lac","lad","lag","lap","law","lay","lea","led","leg","let","lid","lie","lip","lit","log","lot","low","lug",
    "mad","man","map","mar","mat","maw","may","men","met","mid","mix","mob","mom","mop","mow","mud","mug","mum",
    "nab","nag","nap","net","new","nib","nil","nip","nit","nob","nod","nor","not","now","nub","nun","nut",
    "oak","oar","oat","odd","ode","off","oft","ohm","oil","old","one","opt","orb","ore","our","out","owe","owl","own",
    "pad","pal","pan","pap","par","pat","paw","pay","pea","peg","pen","pep","per","pet","pew","pie","pig","pin","pit","ply","pod","pop","pot","pow","pro","pry","pub","pug","pun","pup","pus","put",
    "rag","ram","ran","rap","rat","raw","ray","red","ref","rep","rib","rid","rig","rim","rip","rob","rod","roe","rot","row","rub","rug","rum","run","rut","rye",
    "sac","sad","sag","sap","sat","saw","say","sea","set","sew","she","shy","sin","sip","sir","sis","sit","six","ski","sky","sly","sob","sod","son","sop","sot","sow","soy","spa","spy","sty","sub","sue","sum","sun","sup",
    "tab","tad","tag","tan","tap","tar","tat","tax","tea","ten","the","thy","tic","tie","tin","tip","toe","tog","tom","ton","too","top","tot","tow","toy","try","tub","tug","two",
    "ugh","urn","use",
    "van","vat","vet","via","vie","vim","vow",
    "wad","wag","war","was","wax","way","web","wed","wee","wet","who","why","wig","win","wit","woe","wok","won","woo","wow",
    "yak","yam","yap","yaw","yea","yes","yet","yew","yin","you","yow",
    "zap","zed","zee","zen","zig","zip","zit","zoo",

    // 4-letter words
    "able","ache","acid","aged","aide","akin","ally","also","amid","arch","area","aria","army","arts","atom","aunt","auto","away","axis",
    "baby","back","bait","bake","bald","ball","band","bane","bank","bare","bark","barn","base","bath","beam","bean","bear","beat","beef","been","beer","bell","belt","bend","bent","best","bias","bike","bill","bind","bird","bite","blip","blob","blow","blue","blur","boat","body","boil","bold","bolt","bomb","bond","bone","book","boom","boot","bore","born","boss","both","bowl","brag","bran","bred","brew","brim","brow","buck","buff","bulb","bulk","bull","bump","bunk","burn","bury","bush","busy","butt","buzz",
    "cafe","cage","cake","calf","call","calm","came","camp","cape","caps","card","care","cart","case","cash","cast","cave","cell","cent","chew","chin","chip","chop","cite","city","clad","clam","clan","clap","claw","clay","clip","club","clue","coal","coat","code","coil","coin","cold","cole","colt","comb","come","cone","cook","cool","cope","copy","cord","core","cork","corn","cost","cozy","crab","crew","crop","crow","cube","cult","curb","cure","curl","cute",
    "dame","damp","dare","dark","dart","dash","data","date","dawn","days","dead","deaf","deal","dean","dear","debt","deck","deed","deem","deep","deer","dell","demo","deny","desk","dial","dice","died","diet","dime","dine","dip","dire","dirt","disc","dish","disk","dive","dock","does","doll","dome","done","doom","door","dose","down","doze","drag","draw","drew","drip","drop","drum","dual","duck","duel","duet","duke","dull","duly","dump","dune","dunk","dusk","dust","duty",
    "each","earl","earn","ears","ease","east","easy","echo","edge","edit","else","emit","ends","envy","epic","euro","even","ever","evil","exam","exec","exit","expo","eyed","eyes",
    "face","fact","fade","fail","fair","fake","fall","fame","fang","fare","farm","fast","fate","fear","feat","feed","feel","feet","fell","felt","fern","fest","file","fill","film","find","fine","fire","firm","fish","fist","five","flag","flap","flat","flaw","fled","flew","flex","flip","flit","flow","flux","foam","foil","fold","folk","fond","font","food","fool","foot","ford","fore","fork","form","fort","foul","four","fowl","free","frog","from","fuel","full","fume","fund","funk","fury","fuse","fuss",
    "gain","gala","gale","game","gang","gate","gave","gaze","gear","gene","gift","girl","give","glad","glee","glen","glow","glue","glum","goal","goat","goes","gold","golf","gone","gong","good","gore","gown","grab","gram","gray","grew","grid","grim","grin","grip","grit","grow","gulf","gust","guts",
    "hack","hail","hair","hale","half","hall","halt","hand","hang","hard","hare","harm","harp","hash","haste","hate","haul","have","hawk","haze","hazy","head","heal","heap","hear","heat","heck","heel","heir","held","hell","helm","help","herb","herd","here","hero","hide","high","hike","hill","hilt","hind","hint","hire","hive","hoax","hold","hole","holy","home","hood","hook","hoop","hope","horn","hose","host","hour","howl","hubs","hued","hues","huge","hull","hump","hung","hunt","hurt","hush","hymn",
    "icon","idea","idle","idly","inch","info","into","iron","isle","item",
    "jack","jade","jail","jams","jars","java","jaws","jazz","jean","jeep","jeer","jell","jerk","jest","jibe","jigs","jobs","jock","jogs","join","joke","jolt","jots","jowl","joys","judge","judo","jugs","jump","June","junk","jury","just",
    "kale","keen","keep","kept","keys","kick","kids","kill","kiln","kilt","kind","king","kiss","kite","knee","knew","knit","knob","knot","know",
    "labs","lace","lack","lacy","lads","lady","laid","lake","lamb","lame","lamp","land","lane","laps","lard","lark","lash","lass","last","late","lava","lawn","laws","lazy","lead","leaf","leak","lean","leap","left","lend","lens","less","lest","levy","liar","lice","lick","lids","lied","lies","lieu","life","lift","like","lily","limb","lime","limp","line","link","lint","lion","lips","list","live","load","loaf","loan","lob","lobe","lock","loft","logo","lone","long","look","loom","loop","loot","lord","lore","lose","loss","lost","lots","loud","love","luck","lull","lump","lung","lure","lurk","lush","lust",
    "mace","made","maid","mail","main","make","male","mall","malt","mama","mane","many","maps","mare","mark","mars","mash","mask","mass","mast","mate","math","maze","mead","meal","mean","meat","meek","meet","meld","melt","memo","mend","menu","mere","mesh","mess","mica","mice","mild","mile","milk","mill","mime","mind","mine","mint","mire","miss","mist","mite","mitt","moan","moat","mock","mode","mold","mole","molt","monk","mood","moon","moor","moot","more","morn","moss","most","moth","move","much","muck","muds","muff","mugs","mule","mull","murk","muse","mush","musk","must","mute","myth",
    "nail","name","nape","navy","near","neat","neck","need","neon","nerd","nest","news","next","nice","nick","nine","node","nods","noel","noir","none","nook","noon","nope","norm","nose","note","noun","nude","null","numb","nuns","nuts",
    "oafs","oaks","oath","oats","obey","odds","odor","offs","oils","oily","okay","omen","omit","once","ones","only","onto","onus","ooze","oozy","opal","open","opts","opus","oral","orca","ores","ounce","ours","oust","outs","oven","over","owed","owes","owls","owns",
    "pace","pack","pact","pads","page","paid","pail","pain","pair","pale","palm","pans","papa","pare","park","part","pass","past","path","pave","pawl","pawn","paws","pays","peak","peal","pear","peas","peat","peck","peek","peel","peep","peer","peg","pelt","pens","peon","perk","perm","pest","pets","pick","pier","pies","pigs","pike","pile","pill","pimp","pine","pink","pins","pint","pipe","pips","pita","pith","pits","pity","plan","play","plea","plod","plop","plot","plow","ploy","plug","plum","plus","pock","pods","poem","poet","poke","pole","poll","polo","pomp","pond","pony","pool","poop","poor","pope","pops","pore","pork","port","pose","posh","post","posy","pour","pout","prep","prey","prim","prod","prom","prop","pros","pull","pulp","pump","punk","pure","push","puts",
    "quad","quit","quiz",
    "race","rack","raft","rage","raid","rail","rain","rake","ramp","rang","rank","rant","rape","rare","rash","rasp","rate","rave","rays","raze","read","real","ream","reap","rear","reef","reek","reel","rely","rend","rent","repo","rest","rice","rich","ride","rids","rife","rift","rigs","rind","ring","riot","ripe","rise","risk","rite","road","roam","roar","robe","robs","rock","rode","role","roll","romp","roof","rook","room","root","rope","rose","rosy","rots","rout","rove","rows","rube","rubs","ruby","rude","rued","rues","ruff","rugs","ruin","rule","rump","rune","rung","runs","runt","ruse","rush","rust",
    "sack","safe","saga","sage","said","sail","sake","sale","salt","same","sand","sane","sang","sank","saps","sash","sass","save","says","scab","scam","scan","scar","seal","seam","sear","seas","seat","sect","seed","seek","seem","seen","seep","self","sell","semi","send","sent","sept","serf","sewn","shag","sham","shed","shim","shin","ship","shod","shoe","shoo","shop","shot","show","shun","shut","sick","side","sift","sigh","sign","silk","sill","silo","sine","sing","sink","sins","sips","sire","site","sits","size","skid","skim","skin","skip","slab","slag","slam","slap","slat","slay","sled","slew","slid","slim","slip","slit","slob","slop","slot","slow","slug","slum","slur","smog","snap","snip","snob","snow","snub","snug","soak","soap","soar","sobs","sock","soda","sods","sofa","soft","soil","sold","sole","solo","some","song","soon","soot","sops","sore","sort","sots","soul","soup","sour","span","spar","spas","spat","spec","sped","spin","spit","spot","spud","spun","spur","stab","stag","star","stay","stem","step","stew","stir","stop","stow","stub","stud","stun","such","suck","suds","sued","sues","suit","sulk","sumo","sums","sung","sunk","suns","sure","surf","swan","swap","swat","sway","swim","swum","sync",
    "tack","tact","tags","tail","take","tale","talk","tall","tame","tamp","tank","tape","taps","tarn","tarp","tars","tart","task","taxi","teak","teal","team","tear","teas","tech","teem","teen","tell","temp","tend","tens","tent","term","tern","test","text","than","that","thaw","them","then","they","thin","this","thud","thug","thus","tick","tide","tidy","tied","tier","ties","tile","till","tilt","time","tine","tint","tiny","tips","tire","toad","toes","tofu","toga","toil","told","toll","tomb","tome","tone","tons","tony","took","tool","toot","tops","tore","torn","tort","toss","tote","tots","tour","tout","town","toys","tram","trap","tray","tree","trek","trim","trio","trip","trod","trot","true","tuba","tube","tuck","tuft","tugs","tuna","tune","turf","turn","tusk","tutu","twin","twit","type",
    "ugly","undo","unit","unto","upon","urge","urns","used","user","uses",
    "vain","vale","vane","vans","vary","vase","vast","vats","veal","veer","veil","vein","vend","vent","verb","very","vest","veto","vets","vial","vibe","vice","vied","vies","view","vile","vine","visa","vise","void","volt","vote","vows",
    "wade","wads","waft","wage","wail","wait","wake","walk","wall","wand","wane","want","ward","ware","warm","warn","warp","wars","wary","wash","wasp","wave","wavy","waxy","ways","weak","wean","wear","webs","weds","weed","week","weep","weld","well","welt","went","wept","were","west","what","when","whim","whip","whom","wick","wide","wife","wild","will","wilt","wimp","wind","wine","wing","wink","wipe","wire","wiry","wise","wish","wisp","with","wits","woke","wolf","womb","wont","wood","wool","word","wore","work","worm","worn","wort","wove","wrap","wren",
    "yack","yaks","yams","yang","yank","yaps","yard","yarn","yawl","yawn","yawl","yeah","year","yeas","yell","yelp","yens","yeps","yids","yoke","yolk","yore","your","yowl","yuan","yuck","yule","yummy",
    "zeal","zero","zest","zinc","zing","zips","zits","zone","zoom","zoos"
]);

/**
 * Check if a word exists in the dictionary
 * @param {string} word - The word to check
 * @returns {boolean} - True if word is valid
 */
function isValidWord(word) {
    if (!word || typeof word !== 'string') return false;
    const normalized = word.toLowerCase().trim();
    return DICTIONARY.has(normalized);
}

/**
 * Get all valid words that can be formed from given letters
 * @param {string[]} letters - Array of available letters
 * @returns {string[]} - Array of valid words
 */
function getWordsFromLetters(letters) {
    const validWords = [];
    const letterCount = {};

    // Count available letters
    letters.forEach(letter => {
        const l = letter.toLowerCase();
        letterCount[l] = (letterCount[l] || 0) + 1;
    });

    // Check each word in dictionary
    DICTIONARY.forEach(word => {
        if (canFormWord(word, letterCount)) {
            validWords.push(word);
        }
    });

    // Sort by length (longer words first), then alphabetically
    validWords.sort((a, b) => {
        if (b.length !== a.length) return b.length - a.length;
        return a.localeCompare(b);
    });

    return validWords;
}

/**
 * Check if a word can be formed from available letters
 * @param {string} word - Word to check
 * @param {Object} letterCount - Object with letter counts
 * @returns {boolean}
 */
function canFormWord(word, letterCount) {
    const wordLetters = {};

    // Count letters in word
    for (const letter of word) {
        wordLetters[letter] = (wordLetters[letter] || 0) + 1;
    }

    // Check if we have enough of each letter
    for (const letter in wordLetters) {
        if (!letterCount[letter] || wordLetters[letter] > letterCount[letter]) {
            return false;
        }
    }

    return true;
}

// Export for use in other modules
window.Dictionary = {
    isValidWord,
    getWordsFromLetters,
    canFormWord
};
