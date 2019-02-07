#Let us begin
import pygame
import time
import random
import math
from pygame import gfxdraw
def main():
    pygame.init()
    game_width = 1920
    game_height = 1080
    gray = [127,127,127]
    black = [0,0,0]
    white = [255,255,255]
    red = [255,0,0]
    green = [0,255,0]
    blue = [0,0,255]
    fps = 100
    numBots = 100
    numGenerations = 20
    numChangePerLife = 20
    mutation_rate = 0.2
    colour_change_rate = .05
    colour_mutation_rate = 0.003
    bots = []
    best_ever = 0
    best_ever_dna = []
    gameDisplay = pygame.display.set_mode((game_width, game_height))
    clock = pygame.time.Clock()
    #Change the colour of the bot over acquired change.
    def acquiredChange(colour_code):
        # minus means moving towards black plus means moving towards white.
        percent_change = (random.random() * colour_change_rate)
        newColourNumber = (percent_change * 255) + colour_code[0]
        if(newColourNumber > 255):
            newColourNumber = 255
        elif(newColourNumber < 0):
            newColourNumber = 0
        #Move towards clearer colour
        acquiredChanged_colour = (newColourNumber, newColourNumber, newColourNumber)
        acquiredChanged_colour_code = [newColourNumber, newColourNumber, newColourNumber]
        return(acquiredChanged_colour,acquiredChanged_colour_code)
    class create_bot(): #How to input dna????
        def __init__(self, x, y, dna=False):
            self.position = [x,y]
            self.colour = (gray[0],gray[1],gray[2])
            self.colour_code = gray
            if dna != False:
                #array to keep track of genetics in this case, it keeps track of the colour at the start of the lifecycle of the bot.
                self.dna = dna				
                #if new offspring triggers a mutation
                if random.random() < mutation_rate:
                    #We move the colour slightly (non randomly)
                    mutation_amount = (colour_mutation_rate * 255)
                    if((dna[0] - mutation_amount) < 0):
                        self.colour_code[0] = 0
                        self.colour_code[1] = 0
                        self.colour_code[2] = 0
                    else:
                        self.colour_code[0] = dna[0] - (mutation_amount)
                        self.colour_code[1] = dna[1] - (mutation_amount)
                        self.colour_code[2] = dna[2] - (mutation_amount)
                    self.dna = self.colour_code
                    self.colour = (self.colour_code[0], self.colour_code[1], self.colour_code[2])
                else:
                    #no mutation
                    self.dna = dna
                    self.colour_code = dna
                    self.colour = (self.colour_code[0], self.colour_code[0], self.colour_code[0])
            else:
                #if it is a new bot, then set the color dna to be grey.
                self.dna = gray
        def update(self):
            
            self.colour, self.colour_code = acquiredChange(self.colour_code)
            
        def reproduce(self):
            bots.append(create_bot(self.position[0]+10, self.position[1]+10, self.dna))
        def draw_bot(self, x, y):
            xPos = (x * 20) + 15
            yPos = (y * 20) + 35
            botWidth = 10
            pygame.gfxdraw.aacircle(gameDisplay, xPos, yPos, botWidth, self.colour)
            pygame.gfxdraw.filled_circle(gameDisplay, xPos, yPos, botWidth, self.colour)
            pygame.draw.circle(gameDisplay, black, (xPos,yPos), botWidth+1, 1)
        def draw_best_dna(self, x, y):
            xPos = (x * 20) + 600
            yPos = (y * 20) + 35
            botWidth = 10
            pygame.gfxdraw.aacircle(gameDisplay, xPos, yPos, botWidth, self.dna)
            pygame.gfxdraw.filled_circle(gameDisplay, xPos, yPos, botWidth, self.dna)
            pygame.draw.circle(gameDisplay, black, (xPos,yPos), botWidth+1, 1)			
    #instantiation of bots
    for i in range(numBots):
        bots.append(create_bot(random.uniform(0,game_width),random.uniform(0,game_height)))
    running = True
    countGen = 1
    countChange = 0
    generationBest = []
    while(running):
        gameDisplay.fill(white)
        #set limit of generations.
        if(countGen > numGenerations):
            running = False
            pygame.quit()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        #go through acquired changes with all the bots
        count = 1
        for bot in bots:
            bot.update()
            bot.draw_bot(count,countGen)
            count += 1	
        count = 1
        ycount = 1
                
        #set limit of acquired changes.
        if(countChange >= numChangePerLife):
            #once acquired changes run, it is time to die and reproduce
            countGen += 1
            countChange = 0
            print('Generation ' , countGen -1, ':')
            #sort the list of bots (reverse if black is objective, default if white is objective) To get the best of the generation.
            bots.sort(key=lambda t: t.colour_code[0], reverse = False)
            #print the best values for this generation
            best_ever = bots[0].colour_code
            best_ever_dna = bots[0].dna
            print(best_ever, best_ever_dna)
            #grab the top 25% of population and reproduce them 4 times. Kill the rest.
            
            numReplic = int(numBots *0.25)
            thisGenReproduce = []
            for i in range(numReplic):
                generationBest.append(bots[i])
                thisGenReproduce.append(bots[i])
            #new generation
            del bots[:]
            for i in range(len(thisGenReproduce)):
                for j in range(4):
                    thisGenReproduce[j].reproduce()
        for bot in generationBest:
            bot.draw_bot(count, ycount)
            #bot.draw_best_dna(count, ycount)
            if(count == 25):
                count = 1
                ycount += 1
            else:
                count += 1
            
        #if random.random()<0.02:
            #bots.append(create_bot(random.uniform(0,game_width),random.uniform(0,game_height)))
        #increase the iteration counter and reset the frame.
        countChange += 1
        pygame.display.update()
        clock.tick(fps)
    pygame.quit()
    quit()
main()