import pygame
from pygame.locals import *
from model.utils.Courbe import *
from model.utils.Route import *


class RoadRenderer :

    COLOR_CHECKPOINT = (0,0,255)
    COLOR_POINT = (0,255,255)
    COLOR_COURBE = (31, 169, 83)
    COLOR_ROUTE = (255,0,0)

    def __init__(self,renderer) -> None:
        self.renderer = renderer
        self.update()
    

    def update(self) -> None :
        data = self.getData()
        for (data_p1,data_pc,data_p2) in data:
            # Recuperation des données graphiques des points de la route

            x_1,y_1,height_1,width_1 = data_p1["x"],data_p1["y"],data_p1["height"],data_p1["width"]
            x_c,y_c,height_c,width_c = data_pc["x"],data_pc["y"],data_pc["height"],data_pc["width"]
            x_2,y_2,height_2,width_2 = data_p2["x"],data_p2["y"],data_p2["height"],data_p2["width"]
            y_rend_1 = self.renderer.getHeight() - y_1 - height_1
            y_rend_c = self.renderer.getHeight() - y_c - height_c
            y_rend_2 = self.renderer.getHeight() - y_2 - height_2

            # Dessin P1

            surface = pygame.Surface((width_1, height_1), pygame.SRCALPHA)
            surface.fill(RoadRenderer.COLOR_POINT)
            self.renderer.getMainFrame().blit(surface, (x_1, y_rend_1))

            # Dessin Pc

            surface = pygame.Surface((width_c, height_c), pygame.SRCALPHA)
            surface.fill(RoadRenderer.COLOR_CHECKPOINT)
            self.renderer.getMainFrame().blit(surface, (x_c, y_rend_c))

            # Dessin P2

            surface = pygame.Surface((width_2, height_2), pygame.SRCALPHA)
            surface.fill(RoadRenderer.COLOR_POINT)
            self.renderer.getMainFrame().blit(surface, (x_2, y_rend_2))

            # Dessin Courbe 

            courbe = Courbe(Point(x_1,y_rend_1),Point(x_c,y_rend_c),Point(x_2,y_rend_2))
            for p in courbe.P:
                surface = pygame.Surface((1, 1), pygame.SRCALPHA)
                surface.fill(RoadRenderer.COLOR_COURBE)
                self.renderer.getMainFrame().blit(surface, (p.getX(), p.getY()))
            
            # Dessin de la Route

            route = Route(10,courbe)
            for p in route.getRightPoints():
                surface = pygame.Surface((1, 1), pygame.SRCALPHA)
                surface.fill(RoadRenderer.COLOR_ROUTE)
                self.renderer.getMainFrame().blit(surface, (p[0], p[1]))
            
            for p in route.getLeftPoints():
                surface = pygame.Surface((1, 1), pygame.SRCALPHA)
                surface.fill(RoadRenderer.COLOR_ROUTE)
                self.renderer.getMainFrame().blit(surface, (p[0], p[1]))



    def getData(self) : 
        list_points = self.renderer.getModel().getRoad()
        data = []
        for (p1,pc,p2) in list_points: 
            data.append((self.getDataPoint(p1),self.getDataPoint(pc),self.getDataPoint(p2)))
        return data        


    def getDataPoint(self,point):
        data = dict()
        data["x"] =  self.renderer.getWidth() * point.get_relative_X(self.renderer.getModel().getWidth())
        data["y"] = self.renderer.getHeight() * point.get_relative_Y(self.renderer.getModel().getHeight())
        data["height"] = self.renderer.getHeight() * point.get_relative_height(self.renderer.getModel().getHeight())
        data["width"] = self.renderer.getWidth() * point.get_relative_width(self.renderer.getModel().getWidth())
        return data