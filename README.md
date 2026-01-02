# DSA --- Eksamensprojekt 

Datamatiker -- 4.semester -- Valgfag: DSA (Datastrukturer & algoritmer) 

## Screenshot of Running App 
![alt text](screenshot-running-app.jpg)

## Deloyed version of the App
https://mridrisisci.github.io/datastruktur-algo-miniprojekt/

## Beskrivelse af projektet

Dette projekt handler om at demonstrere visuelt hvordan algoritmen der er udviklet af de 2 russere Georgy Adelson-Velsky and Evgenii Landis i 1962. Demonstrationen lægger vægt på at vise hvad der sker trin for trin. Projektet lægger vægt på indsættelse og balancering, men AVL-tree understøtter også operationerne sletning og søgning

Der er udarbejdet en visuel demonstration af en indsættelsesalgoritme og sikret at man kan se hvad der sker trin for trin. Man kan navigere i webapplikationen ved at bruge knapperne ”previous” og ”next” og ”insert”. Det anbefales at man bruger det klassiske eksempel med 30,20,10. Dette gør man ved at indsætte de vilkårlige værdier ved at bruge ”insert”-knappen. Hertil vil man se disse værdier blive oprettet som noder i diagrammet. 

Man vil se at der sker en rotation automatisk i det man indsætter alle værdierne. Efter indsættelse af værdierne bruger man knapperne ”previous” og next til at se før og efter tistand af indsættelsesalgoritmen.

Diagrammet efter rotationen vil have rykket værdien 30 ned til højre, så værdien ligger på rodens højre barn og værdien 20 vil nu ligge øverst og til sidst vil værdien 10 ligge på rodens venstre barn, da tallet 10 er lavere end 20. 

## Teknologier

- HTML / CSS til brugerflade og layout
- JavaScript 
  - `avl/AVLtree.js`: implementerer AVL-datastrukturen og indsættelsesalgoritmen
  - `main.js`: forbinder UI og algoritme, håndterer knapper og snapshots
  - `view/treerenderer.js`: tegner træet som cirkler og linjer i et SVG-element

## Funktionalitet

- Indsæt et tal via inputfeltet og tryk *Insert*.
- Tallet indsættes i AVL-træet som i et binært søgetræ (venstre < rod < højre).
- Højder og balancefaktorer beregnes, og der udføres rotationer ved ubalance.
- Efter hver indsættelse gemmes et snapshot af træet.
- Med *Previous* / *Next* kan man bladre mellem snapshots og se træets udvikling trin for trin.

## Sådan kører du projektet

1. Åbn `index.html` via en live server eller anden simpel webserver, fx:

	```bash
	python -m http.server 8000
	```

	og gå til `http://localhost:8000` i browseren.
2. Indsæt tal i feltet og tryk *Insert* for at se træet blive opbygget og balanceret.

## Kort om algoritmen

Et AVL-træ er et selvbalancerende binært søgetræ. Efter hver indsættelse opdateres højderne for noderne, og balancefaktoren (venstre højde minus højre højde) beregnes. Hvis forskellen bliver for stor, udføres en eller to rotationer, så træet bevarer en højde på cirka $\log n$. Det giver logaritmisk tid for søgning og indsættelse, også i værste fald.

