Attribute VB_Name = "Mod_Navidad"
Option Explicit
Sub navidad()

    Dim n As Integer
    GrhData(2465).FileNum = 11001
    GrhData(2466).FileNum = 11001
    GrhData(2467).FileNum = 11001
    GrhData(2468).FileNum = 11001
    GrhData(2469).FileNum = 11001
    GrhData(2470).FileNum = 11001
    GrhData(2471).FileNum = 11001
    GrhData(2472).FileNum = 11001
    GrhData(2473).FileNum = 11001
    GrhData(2474).FileNum = 11001
    GrhData(2475).FileNum = 11001
    GrhData(2476).FileNum = 11001
    '--------------------------
    GrhData(7234).FileNum = 11002
    GrhData(7235).FileNum = 11002
    GrhData(7236).FileNum = 11002
    GrhData(7237).FileNum = 11002
    GrhData(7238).FileNum = 11002
    GrhData(7239).FileNum = 11002
    GrhData(7240).FileNum = 11002
    GrhData(7241).FileNum = 11002
    GrhData(7242).FileNum = 11002
    GrhData(7243).FileNum = 11002
    GrhData(7244).FileNum = 11002
    GrhData(7245).FileNum = 11002
    GrhData(7246).FileNum = 11002
    GrhData(7247).FileNum = 11002
    GrhData(7248).FileNum = 11002
    GrhData(7249).FileNum = 11002
    '-----------------------------
    GrhData(7250).FileNum = 11003
    GrhData(7251).FileNum = 11003
    GrhData(7252).FileNum = 11003
    GrhData(7253).FileNum = 11003
    GrhData(7254).FileNum = 11003
    GrhData(7255).FileNum = 11003
    GrhData(7256).FileNum = 11003
    GrhData(7257).FileNum = 11003
    GrhData(7258).FileNum = 11003
    GrhData(7259).FileNum = 11003
    GrhData(7260).FileNum = 11003
    GrhData(7261).FileNum = 11003
    GrhData(7262).FileNum = 11003
    GrhData(7263).FileNum = 11003
    GrhData(7264).FileNum = 11003
    GrhData(7265).FileNum = 11003
    '----------------------------
    GrhData(7266).FileNum = 11004
    GrhData(7267).FileNum = 11004
    GrhData(7268).FileNum = 11004
    GrhData(7269).FileNum = 11004
    GrhData(7270).FileNum = 11004
    GrhData(7271).FileNum = 11004
    GrhData(7272).FileNum = 11004
    GrhData(7273).FileNum = 11004
    GrhData(7274).FileNum = 11004
    GrhData(7275).FileNum = 11004
    GrhData(7276).FileNum = 11004
    GrhData(7277).FileNum = 11004
    GrhData(7278).FileNum = 11004
    GrhData(7279).FileNum = 11004
    GrhData(7280).FileNum = 11004
    GrhData(7281).FileNum = 11004
    '------------------------------
    GrhData(648).FileNum = 11005

    '------------------------------
    'el 5556.bmp (lluvia) pasa al 11001 (nieve) pero eso no va aquí, buscar 5556.bmp en todo el codigo.
    '-------------------------------
    For n = 6000 To 6063
        GrhData(n).FileNum = 11006
    Next n

    For n = 6064 To 6127
        GrhData(n).FileNum = 11007
    Next n

    For n = 6128 To 6191
        GrhData(n).FileNum = 11008
    Next

    For n = 6192 To 6255
        GrhData(n).FileNum = 11009
    Next

    For n = 6256 To 6303
        GrhData(n).FileNum = 11010
    Next

    For n = 6304 To 6351
        GrhData(n).FileNum = 11011
    Next

    For n = 6352 To 6399
        GrhData(n).FileNum = 11012
    Next

    For n = 6400 To 6463
        GrhData(n).FileNum = 11013
    Next

    For n = 6464 To 6527
        GrhData(n).FileNum = 11014
    Next

    For n = 6528 To 6543
        GrhData(n).FileNum = 11015
    Next

    For n = 6544 To 6559
        GrhData(n).FileNum = 11010
    Next

    For n = 7508 To 7571
        GrhData(n).FileNum = 11016
    Next

    For n = 7572 To 7635
        GrhData(n).FileNum = 11017
    Next

    For n = 7636 To 7703
        GrhData(n).FileNum = 11018
    Next
    '------------------------------
    GrhData(7000).FileNum = 11019
    '------------------------------
    GrhData(7001).FileNum = 11020

    '------------------------------
    For n = 9193 To 9198
        GrhData(n).FileNum = 11021
    Next

    GrhData(9205).FileNum = 11022
    GrhData(9206).FileNum = 11022

    For n = 7283 To 7378
        GrhData(n).FileNum = 11023
    Next

    For n = 17329 To 17363
        GrhData(n).FileNum = 11024
    Next
    'techo casa
    GrhData(5591).FileNum = 11121

End Sub

Sub Sintechos()

End Sub
