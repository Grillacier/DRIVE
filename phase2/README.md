# Environnement virtuel de test et d'implémentation de la phase 2
Le point d'entrée du programme est situé dans `main.py`. Ce simulateur à pour but de analyser le comportement du robot en fonction des algorithmes de décision en temps réel qui lui seront affecté. L'architecture de cette appli respecte le format MVC, donc les vues (partie graphique) sont situées dans le package `./view`, les controleurs dans le package `./controls`et le modèle (partie logique) dans le package `./model`. 

Les algorithmes de conduite autonome doivent être implémentés dans le package `./model.algorithmes` et doivent hérité de la classe abstraite `./model.algorithme.Algorithme.py`.
