# Gestion de stock OHADA

Universel

Stock

Productivité

Entreprise

République démocratique du Congo

---

Avec Banana Comptabilité Plus, vous pouvez gérer et valoriser les mouvements de stock de façon simple, directement dans les tableaux du fichier Banana.

Le paquet **Gestion de stock OHADA** ajoute plusieurs extensions destinées à produire des fiches de stock et des rapports de valorisation selon les méthodes les plus utilisées dans la gestion des marchandises. Les extensions lisent les mouvements enregistrés dans le tableau `Transactions`, calculent les entrées, les sorties, les quantités restantes et la valeur du stock, puis génèrent un rapport prêt à être imprimé ou exporté en PDF.

Ce paquet est conçu pour les entreprises, les écoles, les universités, les centres de formation et les professionnels de la comptabilité qui travaillent dans un environnement OHADA, notamment en République démocratique du Congo.

## Fonctionnalités principales

- Analyse des mouvements d'entrée et de sortie des marchandises.
- Calcul automatique des quantités restantes en stock.
- Valorisation du stock selon les méthodes FIFO, LIFO et CUMP.
- Génération de rapports clairs et professionnels.
- Présentation détaillée des entrées, sorties et soldes de stock.
- Résumé final avec quantité et valeur du stock.
- Support pour les exercices pratiques, la formation comptable et la gestion des PME.

## Extensions incluses

### FIFO OHADA

Génère une fiche de stock selon la méthode **First In, First Out**. Les sorties sont valorisées en consommant d'abord les lots entrés en premier.

Cette méthode est utile lorsque l'on veut représenter une rotation naturelle des marchandises, où les anciens lots sont considérés comme vendus ou utilisés avant les lots les plus récents.

### LIFO OHADA

Génère une fiche de stock selon la méthode **Last In, First Out**. Les sorties sont valorisées en consommant d'abord les lots entrés le plus récemment.

Cette méthode permet de comparer l'effet de la valorisation LIFO avec d'autres méthodes, en particulier dans les exercices de formation ou les analyses comparatives.

### CUMP après chaque entrée

Calcule le **Coût Unitaire Moyen Pondéré** après chaque nouvelle entrée de marchandise. Les sorties suivantes sont valorisées avec le coût moyen actualisé.

Cette méthode convient à une gestion progressive du stock, où le coût moyen est recalculé à chaque nouvel achat.

### CUMP à la fin de période

Calcule un **Coût Unitaire Moyen Pondéré** unique à la fin de la période, sur la base des quantités et des valeurs de toutes les entrées.

Cette méthode est utile lorsque la valorisation moyenne est déterminée globalement pour la période analysée, par exemple pour un exercice comptable, un cas pratique ou un rapport de fin de période.

## Fonctionnement

Les extensions traitent les données présentes dans le tableau `Transactions` du fichier Banana. Pour chaque ligne, elles utilisent les informations disponibles suivantes :

- date du mouvement ;
- description de l'opération ;
- quantité entrée ;
- quantité sortie ;
- prix unitaire.

Selon la méthode choisie, l'extension calcule :

- la valeur des entrées ;
- la valeur des sorties ;
- la quantité restante ;
- le coût unitaire appliqué ;
- la valeur finale du stock.

Le résultat est affiché dans un aperçu de rapport Banana, avec l'en-tête de l'entreprise, le tableau des mouvements et le résumé final.

## Rapports générés

Chaque rapport contient :

- les informations d'identification de l'entreprise ou du fichier ;
- la méthode de valorisation utilisée ;
- la liste des mouvements de stock ;
- les colonnes des entrées, sorties et stock restant ;
- les totaux généraux ;
- le résumé final du stock.

Les rapports peuvent être imprimés ou exportés en PDF avec les fonctions standard de Banana Comptabilité Plus.

## Public cible

Ce paquet est particulièrement adapté à :

- petites et moyennes entreprises ;
- écoles et universités ;
- centres de formation comptable ;
- formateurs en comptabilité informatisée ;
- professionnels et consultants OHADA ;
- utilisateurs qui souhaitent comparer plusieurs méthodes de valorisation du stock.

## Installation

Les extensions peuvent être installées dans Banana Comptabilité Plus à partir du menu :

**Extensions > Gérer extensions**

Après l'installation, les commandes du paquet sont disponibles dans le menu **Extensions** du fichier ouvert, si le type de fichier est compatible.

## Utilisation

1. Ouvrir le fichier Banana contenant les mouvements de stock.
2. Vérifier que le tableau `Transactions` contient les colonnes nécessaires pour les quantités et le prix unitaire.
3. Choisir, dans le menu **Extensions**, la méthode de valorisation souhaitée.
4. Afficher l'aperçu du rapport.
5. Imprimer ou exporter le rapport en PDF.

## Fichier d'exemple

Le paquet inclut un fichier d'exemple `stock_banana.ac2` ainsi que plusieurs rapports PDF déjà générés. Ces fichiers permettent de tester les extensions, de vérifier les calculs et de comprendre la présentation des résultats.

## Prérequis

- Banana Comptabilité Plus.
- Plan compatible avec l'utilisation des extensions.
- Fichier Banana contenant des mouvements de stock.

## Remarques

Cette version du paquet est orientée vers la formation, les exercices pratiques et la gestion de stock pour les petites structures. Les extensions facilitent le calcul et la présentation des rapports, mais les résultats doivent toujours être vérifiés selon les règles comptables applicables et la structure réelle du fichier utilisé.

Pour une utilisation professionnelle, il est recommandé de contrôler la cohérence des mouvements, les quantités disponibles et la méthode de valorisation choisie avant de valider les rapports.

