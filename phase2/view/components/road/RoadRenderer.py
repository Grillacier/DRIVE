import pygame
from pygame.locals import *
from model.utils.Courbe import *
from model.utils.Route import *
from model.utils.Circuit import *
from model.algorithmes.AlgoNaif import *

class RoadRenderer :

    COLOR_CHECKPOINT = (0,0,255)
    COLOR_POINT = (0,255,255)
    COLOR_COURBE = (31, 169, 83)
    COLOR_ROUTE = (255,0,0)
    COLOR_BI = (234, 255, 0)
    one = True

    def __init__(self,renderer) -> None:
        self.renderer = renderer
        self.data = self.getData()
        self.dist = []
        self.listPoint = []
        self.listCourbe = []
        self.listRoute = []
        

        for (data_p1,data_pc,data_p2) in self.data:
            # Recuperation des données graphiques des points de la route

            x_1,y_1,height_1,width_1 = data_p1["x"],data_p1["y"],data_p1["height"],data_p1["width"]
            x_c,y_c,height_c,width_c = data_pc["x"],data_pc["y"],data_pc["height"],data_pc["width"]
            x_2,y_2,height_2,width_2 = data_p2["x"],data_p2["y"],data_p2["height"],data_p2["width"]
            y_rend_1 = self.renderer.getHeight() - y_1 - height_1
            y_rend_c = self.renderer.getHeight() - y_c - height_c
            y_rend_2 = self.renderer.getHeight() - y_2 - height_2

            self.listPoint.append({"x_1":x_1,"y_1":y_1,"height_1":height_1,"width_1":width_1,"y_rend_1":y_rend_1,"x_c":x_c,"y_c":y_c,"height_c":height_c,"width_c":width_c,"y_rend_c":y_rend_c,"x_2":x_2,"y_2":y_2,"height_2":height_2,"width_2":width_2,"y_rend_2":y_rend_2})
            
            courbe = Courbe(Point(x_1,y_rend_1),Point(x_c,y_rend_c),Point(x_2,y_rend_2))
            self.listCourbe.append(courbe)
            self.dist.append(courbe.getLongueur(100))

            self.listRoute.append(Route(20,courbe))
        
        self.circuit = Circuit(self.listRoute)
        
        #self.centerCircuit()

        self.renderer.getModel().setCircuit(self.circuit)
        self.renderer.getModel().getRobotAgent().setControlPoint(self.circuit.controlPointsAngle)
        
        self.update()

    def update(self) -> None :
        
        #Dessin des Points

        self.dessinPoint()

        # Dessin Courbe 

        self.dessinCourbe()

        # Dessin Route

        self.dessinRoute()
            
        # Dessin Circuit
        
        self.dessinCircuit()
        destination = self.renderer.getModel().getRobotAgent().getDestination()

        self.drawGivenPoint(Point(destination[0],destination[1]))
        
        # Dessin Point particulier demander
        # p = self.circuit.getPointFromStart(1500)
        # for i in range(0,100,10):
        #     p = Point(500+i,500)
        #     inColor = (11, 154, 11)
        #     outColor = (255, 0, 0)
        #     if self.circuit.OnTheCircuit(p):
        #         color = inColor
        #     else:
        #         color = outColor
        #     surface = pygame.Surface((10, 10), pygame.SRCALPHA)
        #     pygame.draw.circle(surface,color, (5, 5), 5)
        #     self.renderer.getMainFrame().blit(surface, (p.x-5, p.y-5)) #- 5 pour centrer


        self.dessinGivenPoint(Point(AlgoNaif.DESTINATION[0],AlgoNaif.DESTINATION[1]))
    
        
        
        # if RoadRenderer.one:
        #     print(self.dist)
        #     print(f"taille circuit : {self.circuit.longeur} px")
        #     RoadRenderer.one = False



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
    
    def dessinPoint(self):
        for p in self.listPoint:
            # Dessin P1
            surface = pygame.Surface((p["width_1"], p["height_1"]), pygame.SRCALPHA)
            surface.fill(RoadRenderer.COLOR_POINT)
            self.renderer.getMainFrame().blit(surface, (p["x_1"], p["y_rend_1"]))

            # Dessin Pc
            surface = pygame.Surface((p["width_c"], p["height_c"]), pygame.SRCALPHA)
            surface.fill(RoadRenderer.COLOR_CHECKPOINT)
            self.renderer.getMainFrame().blit(surface, (p["x_c"], p["y_rend_c"]))

            # Dessin P2
            surface = pygame.Surface((p["width_2"], p["height_2"]), pygame.SRCALPHA)
            surface.fill(RoadRenderer.COLOR_POINT)
            self.renderer.getMainFrame().blit(surface, (p["x_2"], p["y_rend_2"]))
        
    def dessinCourbe(self):
        for courbe in self.listCourbe:
            for p in courbe.P:
                surface = pygame.Surface((1, 1), pygame.SRCALPHA)
                surface.fill(RoadRenderer.COLOR_COURBE)
                self.renderer.getMainFrame().blit(surface, (p.getX(), p.getY()))
    
    def dessinRoute(self):
        for route in self.listRoute:
            for p in route.getRightPoints():
                surface = pygame.Surface((1, 1), pygame.SRCALPHA)
                surface.fill(RoadRenderer.COLOR_ROUTE)
                self.renderer.getMainFrame().blit(surface, (p[0], p[1]))
            
            for p in route.getLeftPoints():
                surface = pygame.Surface((1, 1), pygame.SRCALPHA)
                surface.fill(RoadRenderer.COLOR_ROUTE)
                self.renderer.getMainFrame().blit(surface, (p[0], p[1]))
    
    def dessinCircuit(self):
        for p in self.circuit.controlPointsAngle:
            surface = pygame.Surface((10, 10), pygame.SRCALPHA)
            pygame.draw.circle(surface, RoadRenderer.COLOR_BI, (5, 5), 5)
            self.renderer.getMainFrame().blit(surface, (p[0]-5, p[1]-5)) #- 5 pour centrer
            
    def drawGivenPoint(self,point:Point):
        surface = pygame.Surface((10, 10), pygame.SRCALPHA)
        pygame.draw.circle(surface,(180, 0, 255), (5, 5), 5)
        pygame.draw.circle(surface,(255, 255, 255), (5, 5), 5, 1)
        self.renderer.getMainFrame().blit(surface, (point.x-5, point.y-5)) #- 5 pour centrer

    def updateCircuit(self):
        self.listCourbe = []
        self.dist = []
        self.listRoute = []
        for p in self.listPoint:
            courbe = Courbe(Point(p["x_1"],p["y_rend_1"]),Point(p["x_c"],p["y_rend_c"]),Point(p["x_2"],p["y_rend_2"]))
            self.listCourbe.append(courbe)
            self.dist.append(courbe.getLongueur(100))

            self.listRoute.append(Route(20,courbe))
        
        self.circuit = Circuit(self.listRoute)

    def centerCircuit(self):
        self.pointCenter = self.circuit.calculateCenter()
        self.incrementPoint = [self.renderer.width/2 - self.pointCenter.x,self.renderer.height/2 - self.pointCenter.y]
        for p in self.listPoint:
            p["x_1"] += self.incrementPoint[0]
            p["y_1"] += self.incrementPoint[1]
            p["x_c"] += self.incrementPoint[0]
            p["y_c"] += self.incrementPoint[1]
            p["x_2"] += self.incrementPoint[0]
            p["y_2"] += self.incrementPoint[1]
            p["y_rend_1"] += self.incrementPoint[1]
            p["y_rend_c"] += self.incrementPoint[1]
            p["y_rend_2"] += self.incrementPoint[1]
        
        self.updateCircuit()