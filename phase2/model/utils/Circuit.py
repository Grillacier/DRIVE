from model.utils.Route import *
import numpy as np

class Circuit:
    def __init__(self, routes:list) -> None:
        self.routes = routes
        self.longeur = round(sum([route.longeur for route in routes]),2)
