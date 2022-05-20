import xml.etree.ElementTree as et
import os.path
import sys

def xml_to_txt(nom_fichier, height = 10 , width = 10):
    f = nom_fichier
    # on importe le fichier XML
    tree = et.parse(f)
    # on lit ce fichier 
    root = tree.getroot()
#     print("L'élément racine : ", root.tag)

    height = height 
    width = width

    left_point_x = []
    left_point_y = []

    right_point_x = []
    right_point_y = []

    control_point_x = []
    control_point_y = []

    for curve in range(len(root[0][0][0].find('curves'))) :
        bzP = root[0][0][0].find('curves')[curve].find('bezierPoints')
        rightPoint = bzP.find('rightPoint')
        leftPoint = bzP.find('leftPoint')
        controlPoint = bzP.find('curvePoint')
        start = root[0][0][0].find('curves')[curve].find('curveDescription')
        
        debut = start.attrib['StartSegment']
        
        if debut == 'l' : 
            leftPoint.attrib['x'] = leftPoint.attrib['x'].split('.')[0]
            leftPoint.attrib['y'] = leftPoint.attrib['y'].split('.')[0]
            left_point_x.append(leftPoint.attrib['x'])
            left_point_y.append(leftPoint.attrib['y'])

            rightPoint.attrib['x'] = rightPoint.attrib['x'].split('.')[0]
            rightPoint.attrib['y'] = rightPoint.attrib['y'].split('.')[0]
            right_point_x.append(rightPoint.attrib['x'])
            right_point_y.append(rightPoint.attrib['y'])

            controlPoint.attrib['x'] = controlPoint.attrib['x'].split('.')[0]
            controlPoint.attrib['y'] = controlPoint.attrib['y'].split('.')[0]
            control_point_x.append(controlPoint.attrib['x'])
            control_point_y.append(controlPoint.attrib['y'])
        else : 
            leftPoint.attrib['x'] = leftPoint.attrib['x'].split('.')[0]
            leftPoint.attrib['y'] = leftPoint.attrib['y'].split('.')[0]
            left_point_x.append(rightPoint.attrib['x'])
            left_point_y.append(rightPoint.attrib['y'])

            rightPoint.attrib['x'] = rightPoint.attrib['x'].split('.')[0]
            rightPoint.attrib['y'] = rightPoint.attrib['y'].split('.')[0]
            right_point_x.append(leftPoint.attrib['x'])
            right_point_y.append(leftPoint.attrib['y'])

            controlPoint.attrib['x'] = controlPoint.attrib['x'].split('.')[0]
            controlPoint.attrib['y'] = controlPoint.attrib['y'].split('.')[0]
            control_point_x.append(controlPoint.attrib['x'])
            control_point_y.append(controlPoint.attrib['y'])

    cpt = 0
    
    while os.path.isfile('./model/circuit/circuit_from_xml'+str(cpt)+'.txt'):
        cpt+=1

    fichier = './model/circuit/circuit_from_xml'+str(cpt)+'.txt'
    new = open(fichier,'w')

    for i in range(len(left_point_x)):            
        # L1
        new.write(str(left_point_x[i]))
        new.write(',')
        new.write(str(left_point_y[i]))
        new.write(',')
        new.write(str(height))
        new.write(',')
        new.write(str(width))
        
        new.write(';')
        
        # PC1
        new.write(str(control_point_x[i]))
        new.write(',')
        new.write(str(control_point_y[i]))
        new.write(',')
        new.write(str(height))
        new.write(',')
        new.write(str(width))
        
        new.write(';')
        
        # R1
        new.write(str(right_point_x[i]))
        new.write(',')
        new.write(str(right_point_y[i]))
        new.write(',')
        new.write(str(height))
        new.write(',')
        new.write(str(width))
        
        new.write('\n')
    new.close()
    
#     print(left_point_x)
#     print(left_point_y)

#     print(right_point_x)
#     print(right_point_y)

#     print(control_point_x)
#     print(control_point_y)

    return fichier

if __name__ == '__main__':
    args = sys.argv[1:]
    nom_fichier = xml_to_txt(args[0])
    print('conversion terminé ! ')
    print(f'le fichier {nom_fichier} a été créé')