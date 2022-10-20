"""
--------------------------------------------------------------------------
VERSION LINUX : Thread pour l'affichage et les controles sont activés
--------------------------------------------------------------------------

Plateforme de test | PHASE 2 | pour implémenter et tester les algorithmes d'amélioration de conduite pour le robot turtlebot3
Liste des membres du projet :
    Jeremy DUFOURMANTELLE
    Ethan ABITBOL
    Jules CASSAN
    Elias BENDJABALLAH
"""

"""
Point d'entrée du programme
"""
import math
from model.Environment import Environment
from view.Renderer import Renderer
from controls.Controls import Controls
import pygame

pygame.init()

"""
Initialisation des composants de l'app
"""

envt = Environment()
renderer = Renderer(envt)
envt.robotAgent.setPosition(renderer.roadRenderer.circuit.controlPointsAngle[0][0], renderer.roadRenderer.circuit.controlPointsAngle[0][1])
envt.robotAgent.setFirstPosition(envt.robotAgent.getPosition())
angle = 2 *math.pi-envt.thread.angle(1, 0, (envt.circuit.controlPointsAngle[1][0] - envt.robotAgent.getFirstPosition().getX()), (envt.circuit.controlPointsAngle[1][1] -envt.robotAgent.getFirstPosition().getY()))
envt.robotAgent.setRadian(angle)
# print("angle :", envt.thread.angle(1,0,0,1))
# print("angle :", envt.thread.angle(1,0,0,-1))
envt.robotAgent.setVecteurDirecteur(envt.robotAgent.getRadian().radToVectorDirector())

# for p in renderer.roadRenderer.circuit.controlPointsAngle:
#     print("controlPointsAngle : ", p)

envt.start() # Lancement du thread de l'environnement

# ne marche pas
#envt.saveRoad(20)


renderer.start() # Lancement du thread de l'affichage
controls = Controls(envt,renderer)
controls.start() # Lancement du thread des controles