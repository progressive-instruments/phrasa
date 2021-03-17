grammar Notes;

main: NOTE (PSIK NOTE)*;

WS: [ t]+ -> skip;

NOTE: [a-gA-G] '#'? '-'? [0-9];
PSIK: ',';