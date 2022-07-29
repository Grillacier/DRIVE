# P-ANDROIDE

Bienvenue sur le dépot Gihub du projet PANDROIDE 2022 d'**amélioration de la conduite d'un robot roulant intelligent et autonome**.

Ce projet est la réalisation d'une équipe d'étudiant M1 ANDROIDE de Sorbonne Jussieu constituée de Jérémy Dufourmantelle, Ethan Abitbol, Elias Bendjaballah et Jules Cassan.

## Rapport 
Le **Rapport_Projet_Pandroide.pdf** vous permettra de comprendre la portée et les objectifs de ce projet ainsi que les recherches effectuées pour sa réalisation.

## Simulateur 

&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;![python_FPn7NV9qKL](https://user-images.githubusercontent.com/74248238/169619259-38e7b22e-337a-481b-b0d7-cf908df58c14.gif)


Le point d'entrée du programme est contenu dans les fichiers `mainLinuxOS.py` et `mainWindowsOS.py` pour les utilisateurs respectifs de ces systèmes. Ces différents point d'entrée ont dû être développés en raison de problème de thread lié à PyGame avec Windows. Nous pouvons voir sur la représentation de l'architecture de l'outil ci-contre les trois modules `./model`, `./view` et `./controls`.
L'environnement sera représenté dans la classe `Environnement.py` avec une hauteur et largeur défini à **1000** unités. Il est important de noter que l'environnement se lance avec un thread dans `modelThread` avec une vitesse d'évolution de **0.1**s. La partie graphique est contenu dans le répertoire `./view` et tous les composants sont contenus dans le répétoire `./view/components/`.Tout comme la partie logique, la vue possède aussi son thread : `RendererThread` qui a un facteur d'actualisation de **0.01**s.

Tous les algorithmes d'amélioration de la conduite automatique du robot doivent être implémenté dans le package `./model/algorithmes` et devront hériter de la classe `Algorithme.py`. Ces algorithmes pourront utiliser les utilitaires géométriques contenu dans le package `./model/utils` comme `Droite.py`,`Point.py`,`Radian.py`,etc... Ils pourront aussi avoir accès aux valeurs du robot comme sa vitesse linéaire/angulaire courante, sa position ou encore sa caméra défini dans `./model/percepts/Camera.py`.

<img width="1797" alt="architecture_p_and" src="https://user-images.githubusercontent.com/74248238/169619212-18d4c70c-dd60-4771-8cbe-ee76eb75501f.png">

## Gazebo

&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;![image](https://user-images.githubusercontent.com/74248238/169619420-77f63bc5-be1a-4e3b-941a-1c2645d0e3c7.png)

## Manuel d'utilisation

### Recupération du code
Afin de configurer votre environnement et pouvoir tester nos implémentations,veuillez suivre les indications suivantes : Avant tout, téléchargez le répertoire conte
nant nos implémentations de la manière suivante :\
`git clone https://github.com/jdufou1/P-ANDROIDE`

### Lancement du simulateur

Vous aurez besoin de **Python3** ( Nous avons utilisé la version 3.9.9 ) pour l’exécution du simulateur ainsi que des librairies **numpy** ( version 1.21.5 ) et **pygame** (
version 2.1.2 ). Déplacez vous ensuite dans le répertoire *phase2* \
`cd phase2`\
puis lancez le simulateur avec une des deux commandes suivante selon votresystème d’exploitation. \
`python3 mainLinuxOS.py`\
`python3 mainWindowsOS.py`\
