# DSA --- Eksamensprojekt 

Datamatiker -- 4.semester -- Valgfag: DSA (Datastrukturer & algoritmer) 

## Screenshot of Running App 
![alt text](screenshot-running-app.jpg)

## Deloyed version of the App
https://mridrisisci.github.io/DSA-AVL-Tree/

## Beskrivelse af projektet

Projektet handler om at implementere en algoritme og visuelt fremvise hvordan algoritmen sker trin for trin for en given operation. Min visualisering lægger vægt på at fremvise processen for indsættelsesoperationen for et AVL-tree. Denne proces ser man trin for trin med udgangspunkt i hvordan logikken er skrevet i AVLTree.js. 

Man kan anvende webapplikationen ved at køre sin webserver lokalt på sin maskine. Herefter besøger man webstedet – typisk localhost:5500. Man bliver mødt af et blankt kanvas og 3 knapper – insert, previous og next. Disse knapper bruges til at udforske funktionaliteten af indsættelsesoperationen. 

Man kan tage udgangspunkt i eksemplet 30,20,10. Man indsætter dem enkeltvis i den rækkefølge, det er skrevet. Resultat af indsættelsen for eksemplet ovenfor skaber en BST-struktur. Ved at klikke på next og previous knapperne kan man følge med trin for trin i hvordan BST-strukturen konceptuelt balancerer sig. Formålet med balanceringen er at opnå et selvbalancerende binært søgetræ aka. AVL-tree. 


## Teknologier

- HTML / CSS til brugerflade og layout
- JavaScript 
  - `avl/AVLtree.js`: implementerer AVL-datastrukturen og indsættelsesalgoritmen
  - `main.js`: forbinder UI og algoritme, håndterer knapper og snapshots
  - `view/treerenderer.js`: tegner træet som cirkler og linjer i et SVG-element

## Funktionalitet

- Indsæt et tal via inputfeltet og tryk *Insert*.
- Tallet indsættes i AVL-træet som i et binært søgetræ.
- Højder og balancefaktorer beregnes, og der udføres rotationer ved ubalance.
- Efter hver indsættelse gemmes et snapshot af træet.
- Med *Previous* / *Next* kan man bladre mellem snapshots og se træets udvikling trin for trin.

## Sådan kører du projektet

1. Åbn `index.html` via en live server eller anden simpel webserver, fx:

	```bash
	python -m http.server 8000
	```

	og gå til `http://localhost:[PORT]` i browseren.
2. Indsæt tal i feltet og tryk *Insert* for at se træet blive opbygget og balanceret.

## Kort om algoritmen

