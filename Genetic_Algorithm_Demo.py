#Let us begin
import tkinter
import pygame
import time
import random
import math
from pygame import gfxdraw
from tkinter import *
import tkinter.simpledialog
import tkinter.messagebox
import cx_Freeze
def main():
    pygame.init()
    game_width = 1920
    game_height = 1080
    initial = [255,150,150]
    black = [0,0,0]
    white = [255,255,255]
    red = [150,0,0]
    brightRed = [255,0,0]
    green = [0,200,0]
    brightGreen =[0,255,0]
    blue = [0,0,200]
    brightBlue = [0, 0, 255]
    fps = 165
    numBots = 100
    mutation_rate = 0.4
    colour_change_rate = .025

    colour_mutation_rate = 0.045
    bots = []
    best_ever = 0
    best_ever_dna = []
    gameDisplay = pygame.display.set_mode((game_width, game_height))
    clock = pygame.time.Clock()
    smalltext = pygame.font.Font('freesansbold.ttf', 20)
    #Change the colour of the bot over acquired change.


    def acquiredChange(colour_code):
        # minus means moving towards black plus means moving towards white.
        percent_change = (random.random() * colour_change_rate)
        newColourNumber = (percent_change * 255) + colour_code[1]
        if(newColourNumber > 255):
            newColourNumber = 255
        elif(newColourNumber < 0):
            newColourNumber = 0
        #Move towards clearer colour
        acquiredChanged_colour = (255, newColourNumber, newColourNumber)
        acquiredChanged_colour_code = [255, newColourNumber, newColourNumber]
        return(acquiredChanged_colour,acquiredChanged_colour_code)

    def message_display(text, x, y, font):
        textSurt, TextRect = text_objects(text, font)
        TextRect.center =((x*20+90),(y*20 + 35))
        gameDisplay.blit(textSurt, TextRect)
    def message_display_end(text, x, y, font):
        textSurt, TextRect = text_objects(text, font)
        TextRect.center =((x/2),(y/2))
        gameDisplay.blit(textSurt, TextRect)

    def text_objects(text, font):
        textSurface = font.render(text, True, black)
        return textSurface, textSurface.get_rect()

    def quit_game():
        del bots[:]
        pygame.quit()
        quit()

    def button(msg,x,y,w,h,ic,ac, action = None):
        mouse = pygame.mouse.get_pos()
        click = pygame.mouse.get_pressed()
        if (x + w > mouse[0] > x and y + h > mouse[1] > y):
            pygame.draw.rect(gameDisplay, ac, (x, y, w, h))
            if(click[0] == 1 and action !=None):
                action()
        else:
            pygame.draw.rect(gameDisplay, ic, (x, y, w, h))
        textSurf, textRect = text_objects(msg, smalltext)
        textRect.center = ((x + (w / 2)), y + (h / 2))
        gameDisplay.blit(textSurf, textRect)

    def end_screen(gen, botsPerGen, genBestList):
        # draw the generation best!
        smalltext = pygame.font.Font('freesansbold.ttf', 20)
        end = True
        while end:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    quit_game()
            count = 1
            ycount = 1
            for bot in genBestList:
                bot.draw_best_changed(count, ycount)
                bot.draw_best_dna(count, ycount)
                if count == botsPerGen:
                    count = 1
                    ycount += 1
                else:
                    count += 1
            for i in range(1, gen):
                message_display("Generation " + str(i) + " best: ", 1, i,smalltext)
            message_display_end('Colour at death', 1000, 50, smalltext)
            message_display_end('DNA at death', 2200, 50, smalltext)

            button('Main Menu', 720, 250, 100, 50, green, brightGreen, mainMenu)
            button('Quit',720, 450,100, 50, red, brightRed, quit_game)

            pygame.display.update()
            clock.tick(60)
        quit_game()

    def mainMenu():
        running = True
        smalltext = pygame.font.Font('freesansbold.ttf', 20)
        largetext = pygame.font.Font('freesansbold.ttf', 50)
        while running:
            gameDisplay.fill(white)
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                    quit_game()
            message_display_end("Genetic Algorithm Simulation for Acquired Change",game_width , game_height - 200, largetext)
            button('Run Darwinian Simulation', game_width/2 - 800, game_height/2 + 200, 300, 75, green, brightGreen, game_loop)
            button('Custom Simulation', game_width / 2 -200, game_height / 2 + 200, 300, 75, blue,brightBlue, customSim)
            button('Run Non Darwinian simulation', game_width / 2 + 400, game_height / 2 + 200, 300, 75, red, brightRed,
                   nonDarwin)
            pygame.display.update()
            clock.tick(fps)
        pygame.quit()

    def customSim():
        root = Tk()
        w = Label(root, text = 'Custom Simulation')
        w.pack()
        userGenNum = tkinter.simpledialog.askinteger("Input","How many generations do you want? Recommended < 50")
        userMutRate = tkinter.simpledialog.askfloat("Input", "How often do they mutate (mutation rate) between 0 and 1")
        userChngNum = tkinter.simpledialog.askinteger("Input", "How many times do they change in their life? Recommended < 200")
        userChngAmnt = tkinter.simpledialog.askfloat("Input", "How much do they change every time? Recommended < 1/numChanges")
        darwin = tkinter.messagebox.askyesno('Input', "Do you wish to inherit only DNA and not acquired changes?")


        def validate():
            if  userGenNum > 0 and userGenNum < 1000:
                GenNum = userGenNum
            else:
                print('Input invalid using default')
                GenNum = 30
            if 0<userMutRate<1:
                MutRate = userMutRate
            else:
                print('Input invalid using default')
                MutRate = 0.4
            if 0 < userChngNum < 500:
                ChngNum = userChngNum
            else:
                print('Input invalid using default')
                ChngNum = 30
            if 0 <= userChngAmnt <= 1:
                ChngAmnt = userChngAmnt
            else:
                print('Input invalid using default')
                ChngAmnt = 0.045

            game_loop(GenNum, MutRate, ChngNum, ChngAmnt, darwin)

        validate()

    class create_bot(): #How to input dna????
        def __init__(self, x, y, dna=False, Darwin = True):
            self.position = [x,y]
            self.colour = (initial[0],initial[1],initial[2])
            self.colour_code = list(initial)
            if dna != False:
                # array to keep track of genetics in this case,
                # it keeps track of the colour at the start of the lifecycle of the bot.
                self.dna = list(dna)
                # if new offspring triggers a mutation
                if random.random() < mutation_rate:
                    # We move the colour slightly (randomly)
                    mutation_amount = (colour_mutation_rate * random.random() * 255)
                    if (dna[0] - mutation_amount) < 0:
                        self.colour_code[0] = 0
                        self.colour_code[1] = 0
                        self.colour_code[2] = 0
                    else:
                        self.colour_code[0] = 255
                        self.colour_code[1] = max(dna[1] - (mutation_amount), 0)
                        self.colour_code[2] = max(dna[2] - (mutation_amount), 0)
                    self.dna = list(self.colour_code)
                    self.colour = (self.colour_code[0], self.colour_code[1], self.colour_code[2])
                else:
                    #no mutation
                    self.dna = list(dna)
                    self.colour_code = list(dna)
                    self.colour = (self.colour_code[0], self.colour_code[0], self.colour_code[0])
            else:
                #if it is a new bot, then set the color dna to be grey.
                self.dna = list(initial)

        def update(self):
            self.colour, self.colour_code = acquiredChange(self.colour_code)
            
        def reproduce(self):
            bots.append(create_bot(self.position[0]+10, self.position[1]+10, self.dna))

        def reproduce_nonDarwin(self):
            bots.append(create_bot(self.position[0] + 10, self.position[1] + 10, self.colour))

        def draw_bot(self, x, y):
            xPos = (x * 20)
            yPos = (y * 20) + 35
            botWidth = 10
            pygame.gfxdraw.aacircle(gameDisplay, xPos, yPos, botWidth, self.colour)
            pygame.gfxdraw.filled_circle(gameDisplay, xPos, yPos, botWidth, self.colour)
            pygame.draw.circle(gameDisplay, black, (xPos,yPos), botWidth+1, 1)

        def draw_best_dna(self, x, y):
            xPos = (x * 20) + 825
            yPos = (y * 20) + 35
            botWidth = 10
            pygame.gfxdraw.aacircle(gameDisplay, xPos, yPos, botWidth, self.dna)
            pygame.gfxdraw.filled_circle(gameDisplay, xPos, yPos, botWidth, self.dna)
            pygame.draw.circle(gameDisplay, black, (xPos,yPos), botWidth+1, 1)

        def draw_best_changed(self, x, y):
            xPos = (x * 20) + 200
            yPos = (y * 20) + 35
            botWidth = 10
            pygame.gfxdraw.aacircle(gameDisplay, xPos, yPos, botWidth, self.colour)
            pygame.gfxdraw.filled_circle(gameDisplay, xPos, yPos, botWidth, self.colour)
            pygame.draw.circle(gameDisplay, black, (xPos,yPos), botWidth+1, 1)

    def nonDarwin():
        game_loop(30,.4,30,.045,False)

    def game_loop(numGenerations = 30,  mutation_rate = 0.4,numChangePerLife = 30, colour_change_rate = .045, Darwin = True):
        del bots[:]
        # instantiation of bots
        for i in range(numBots):
            bots.append(create_bot(random.uniform(0,game_width),random.uniform(0,game_height)))
        running = True
        countGen = 1
        countChange = 0
        generationBest = []

        # Simulation start
        while(running):
            gameDisplay.fill(white)
            # set limit of generations.
            if(countGen > numGenerations):
                running = False
                end_screen(countGen,25,generationBest)
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                    quit_game()
            # go through acquired changes with all the bots
            count = 1
            for bot in bots:
                bot.update()
                bot.draw_bot(count,countGen)
                count += 1
            message_display('Running Simulation...',1.2, .1, smalltext)

            # set limit of acquired changes.
            if countChange >= numChangePerLife:

                # once acquired changes run, it is time to die and reproduce
                countGen += 1
                countChange = 0
                print('Generation ' , countGen -1, ':')
                # sort the list of bots (reverse if black is objective,
                # default if white is objective) To get the best of the generation.
                bots.sort(key=lambda t: t.colour_code[1], reverse = False)
                # print the best values for this generation
                best_ever = bots[0].colour_code
                best_ever_dna = list(bots[0].dna)
                print(best_ever, best_ever_dna)
                # grab the top 25% of population and reproduce them 4 times. Kill the rest.
                numReplic = int(numBots *0.25)
                thisGenReproduce = []
                for i in range(numReplic):
                    generationBest.append(bots[i])
                    thisGenReproduce.append(bots[i])
                # new generation
                del bots[:]
                for i in range(len(thisGenReproduce)):
                    for j in range(4):
                        if(Darwin):
                            thisGenReproduce[i].reproduce()
                        else:
                            thisGenReproduce[i].reproduce_nonDarwin()

            # if random.random()<0.02:
                # bots.append(create_bot(random.uniform(0,game_width),random.uniform(0,game_height)))
            # increase the iteration counter and reset the frame.
            countChange += 1
            pygame.display.update()
            clock.tick(fps)
        quit_game()
    mainMenu()
main()