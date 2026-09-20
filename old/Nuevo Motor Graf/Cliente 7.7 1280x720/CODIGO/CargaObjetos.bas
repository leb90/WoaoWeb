Attribute VB_Name = "CargaObjetos"
Option Explicit

'<------------------CATEGORIAS PRINCIPALES--------->
Enum eObjType
    
    otUSEONCE = 1
    otWEAPON = 2
    otARMOUR = 3
    otARBOLES = 4
    otGUITA = 5
    otPUERTAS = 6
    otCONTENEDORES = 7
    otCARTELES = 8
    otLLAVES = 9
    otFOROS = 10
    otPOCIONES = 11
    otBEBIDA = 13
    otLEÑA = 14
    otFOGATA = 15
    otHERRAMIENTAS = 18
    otYACIMIENTO = 22
    otPERGAMINOS = 24
    otteleport = 19
    otYUNQUE = 27
    otFRAGUA = 28
    otMINERALES = 23
    otBARCOS = 31
    otCUALQUIERA = 1000
    otINSTRUMENTOS = 26
    otFLECHAS = 32
    otBOTELLAVACIA = 33
    otBOTELLALLENA = 34
    otMANCHAS = 35
    ottele = 36
    otresu = 37
    otsana = 38
    otpara = 39
    otregalo = 40
    otAnillo = 41
    otMontura = 60
    otALAS = 61
    '<------------------SUB-CATEGORIAS----------------->
    otARMADURA = 0
    otCASCO = 1
    otESCUDO = 2
    otCAÑA = 138
    '[GAU]
    otBOTA = 3
    '[GAU]

End Enum

'Tipos de objetos
Private Type ObjData

    'pluto:6.0A
    ParaCarpin As Byte
    ParaErmi As Byte
    ParaHerre As Byte

    ArmaNpc As Integer
    Name As String    'Nombre del obj
    'pluto:2.8.0
    Vendible As Integer

    ObjType As eObjType     'Tipo enum que determina cuales son las caract del obj
    SubTipo As Integer    'Tipo enum que determina cuales son las caract del obj
    'pluto:7.0
    Drop As Byte
    GrhIndex As Long    ' Indice del grafico que representa el obj
    GrhSecundario As Long
    'pluto:2.3
    peso As Double

    Respawn As Byte

    'Solo contenedores
    MaxItems As Integer
    Apuñala As Byte

    HechizoIndex As Integer

    ForoID As String

    MinHP As Integer    ' Minimo puntos de vida
    MaxHP As Integer    ' Maximo puntos de vida

    MineralIndex As Integer
    'LingoteInex As Integer

    proyectil As Integer
    Municion As Integer

    Crucial As Byte
    Newbie As Integer

    'Puntos de Stamina que da
    MinSta As Integer    ' Minimo puntos de stamina

    'Pociones
    TipoPocion As Byte
    MaxModificador As Integer
    MinModificador As Integer
    DuracionEfecto As Long
    MinSkill As Integer
    LingoteIndex As Integer

    MinHit As Integer    'Minimo golpe
    MaxHit As Integer    'Maximo golpe

    MinHam As Integer
    MinSed As Integer

    Def As Integer
    MinDef As Integer    ' Armaduras
    MaxDef As Integer    ' Armaduras
    'pluto:7.0
    Defmagica As Integer
    'nati: agrego defcuerpo
    Defcuerpo As Integer
    'Defproyectil As Integer

    Ropaje As Integer    'Indice del grafico del ropaje

    WeaponAnim As Integer    ' Apunta a una anim de armas
    ShieldAnim As Integer    ' Apunta a una anim de escudo
    CascoAnim As Integer
    AlasAnim As Integer
    '[GAU]
    Botas As Integer
    '[GAU]
    Valor As Long     ' Precio
    objetoespecial As Integer
    Cerrada As Integer
    Llave As Byte
    Clave As Long    'si clave=llave la puerta se abre o cierra

    IndexAbierta As Integer
    IndexCerrada As Integer
    IndexCerradaLlave As Integer

    RazaEnana As Byte
    Mujer As Byte
    Hombre As Byte
    Envenena As Byte
    Magia As Byte
    Resistencia As Long
    Agarrable As Byte

    LingH As Long
    LingO As Long
    LingP As Long
    Madera As Long
    '[MerLiNz:6]
    Gemas As Long
    Diamantes As Long
    'pluto:2.10
    ObjetoClan As String
    '[\END]

    SkHerreria As Byte
    SkCarpinteria As Byte

    texto As String

    'Clases que no tienen permitido usar este obj
    ClaseProhibida(1 To NUMCLASES) As String

    Snd1 As Integer
    Snd2 As Integer
    Snd3 As Integer
    MinInt As Integer

    Real As Byte
    Caos As Byte
    nocaer As Byte
    razaelfa As Byte
    razavampiro As Byte
    razahumana As Byte
    razaorca As Byte
    SkArco As Byte
    SkArma As Byte
    Cregalos As Integer
    Pregalo As Byte

End Type

Private Type Hechizos

    Nombre As String
    Desc As String
    PalabrasMagicas As String

    HechizeroMsg As String
    TargetMsg As String
    PropioMsg As String

    Resis As Byte

    Tipo As Byte
    WAV As Integer
    FXgrh As Integer
    Loops As Byte

    SubeHP As Byte
    MinHP As Integer
    MaxHP As Integer

    SubeMana As Byte
    MiMana As Integer
    MaMana As Integer

    SubeSta As Byte
    MinSta As Integer
    MaxSta As Integer

    SubeHam As Byte
    MinHam As Integer
    MaxHam As Integer

    SubeSed As Byte
    MinSed As Integer
    MaxSed As Integer

    SubeAgilidad As Byte
    MinAgilidad As Integer
    MaxAgilidad As Integer

    SubeFuerza As Byte
    MinFuerza As Integer
    MaxFuerza As Integer

    SubeCarisma As Byte
    MinCarisma As Integer
    MaxCarisma As Integer

    Invisibilidad As Byte
    Paraliza As Byte
    Paralizaarea As Byte
    RemoverParalisis As Byte
    CuraVeneno As Byte
    Envenena As Byte
    
    'pluto:2.15
    Protec As Byte
    Maldicion As Byte
    RemoverMaldicion As Byte
    Bendicion As Byte
    Estupidez As Byte
    Ceguera As Byte
    Revivir As Byte
    Morph As Byte
    RemueveInvisibilidadParcial As Byte

    invoca As Byte
    NumNpc As Integer
    Cant As Integer

    Noesquivar As Byte
    itemIndex As Byte

    MinSkill As Integer
    MinNivel As Byte
    ManaRequerido As Integer

    Target As Byte

End Type

'hechizos nuevos cantidad
Public Hechizos(1 To 75) As Hechizos

Public NumArboles        As Integer
Public ListArboles()     As Long

'Tipos de objetos
Public ObjData()         As ObjData

Public DataTrabajo()  As Integer
Public NumTrabajo     As Integer

Sub CargamosHechizos()

    On Error GoTo Errorfeo

    Hechizos(1).Nombre = "Curar veneno"
    Hechizos(1).Desc = "Cura el envenenamiento"
    Hechizos(1).PalabrasMagicas = "NIHIL VED"
    Hechizos(1).HechizeroMsg = "Has curado a"
    Hechizos(1).PropioMsg = "Te has curado del envenenamiento."
    Hechizos(1).TargetMsg = "te ha curado del envenenamiento."
    Hechizos(1).CuraVeneno = 1
    Hechizos(1).FXgrh = 107
    Hechizos(1).Loops = 1
    Hechizos(1).ManaRequerido = 10
    Hechizos(1).MinSkill = 8
    Hechizos(1).Target = 1
    Hechizos(1).Tipo = 2
    Hechizos(1).WAV = 16
    Hechizos(2).Nombre = "Dardo Mágico"
    Hechizos(2).Desc = "Causa 5 a 10 puntos de daño a la víctima."
    Hechizos(2).PalabrasMagicas = "OHL VOR PEK"
    Hechizos(2).HechizeroMsg = "Has lanzado dardo mágico sobre"
    Hechizos(2).PropioMsg = ""
    Hechizos(2).TargetMsg = "lanzo dardo mágico sobre tí."
    Hechizos(2).FXgrh = 122
    Hechizos(2).Loops = 1
    Hechizos(2).ManaRequerido = 12
    Hechizos(2).MaxHP = 10
    Hechizos(2).MinHP = 5
    Hechizos(2).MinSkill = 6
    Hechizos(2).Resis = 1
    Hechizos(2).SubeHP = 2
    Hechizos(2).Target = 3
    Hechizos(2).Tipo = 1
    Hechizos(2).WAV = 16
    Hechizos(3).Nombre = "Curar Heridas Leves"
    Hechizos(3).Desc = "Curar heridas leves, restaura entre 1 y 5 puntos de salud."
    Hechizos(3).PalabrasMagicas = "CORP SANC"
    Hechizos(3).HechizeroMsg = "Has sanado a"
    Hechizos(3).PropioMsg = "Te has curado algunas heridas."
    Hechizos(3).TargetMsg = "te ha curado algunas heridas."
    Hechizos(3).FXgrh = 9
    Hechizos(3).Loops = 1
    Hechizos(3).ManaRequerido = 10
    Hechizos(3).MaxHP = 5
    Hechizos(3).MinHP = 1
    Hechizos(3).MinSkill = 10
    Hechizos(3).SubeHP = 1
    Hechizos(3).Target = 3
    Hechizos(3).Tipo = 1
    Hechizos(3).WAV = 17
    Hechizos(4).Nombre = "Envenenar"
    Hechizos(4).Desc = "Envenenamiento. Provoca la muerte si no se contraresta el veneno."
    Hechizos(4).PalabrasMagicas = "SERP XON IN"
    Hechizos(4).HechizeroMsg = "Has envenenado a"
    Hechizos(4).PropioMsg = "Te has envenenado."
    Hechizos(4).TargetMsg = "te ha envenenado."
    Hechizos(4).Envenena = 5
    Hechizos(4).FXgrh = 30
    Hechizos(4).Loops = 3
    Hechizos(4).ManaRequerido = 20
    Hechizos(4).MinSkill = 20
    Hechizos(4).Resis = 1
    Hechizos(4).Target = 3
    Hechizos(4).Tipo = 2
    Hechizos(4).WAV = 16
    Hechizos(5).Nombre = "Curar heridas graves"
    Hechizos(5).Desc = "Curar heridas graves, restaura entre 15 y 25 puntos de salud."
    Hechizos(5).PalabrasMagicas = "EN CORP SANCTIS"
    Hechizos(5).HechizeroMsg = "Has sanado a"
    Hechizos(5).PropioMsg = "Te has curado algunas heridas."
    Hechizos(5).TargetMsg = "te ha curado algunas heridas."
    Hechizos(5).FXgrh = 9
    Hechizos(5).Loops = 1
    Hechizos(5).ManaRequerido = 40
    Hechizos(5).MaxHP = 25
    Hechizos(5).MinHP = 15
    Hechizos(5).MinSkill = 38
    Hechizos(5).SubeHP = 1
    Hechizos(5).Target = 3
    Hechizos(5).Tipo = 1
    Hechizos(5).WAV = 18
    Hechizos(6).Nombre = "Flecha mágica"
    Hechizos(6).Desc = "Causa 6 a 12 puntos de daño a la victima."
    Hechizos(6).PalabrasMagicas = "VAX PER"
    Hechizos(6).HechizeroMsg = "Has lanzado flecha magica sobre "
    Hechizos(6).PropioMsg = "Has lanzado flecha magica sobre tí."
    Hechizos(6).TargetMsg = "lanzo flecha magica sobre tí."
    Hechizos(6).ManaRequerido = 20
    Hechizos(6).MaxHP = 15
    Hechizos(6).MinHP = 10
    Hechizos(6).MinSkill = 12
    Hechizos(6).Resis = 1
    Hechizos(6).SubeHP = 2
    Hechizos(6).Target = 3
    Hechizos(6).Tipo = 1
    Hechizos(6).WAV = 19
    Hechizos(7).Nombre = "Flecha eléctrica"
    Hechizos(7).Desc = "Causa 15 a 25 puntos de daño a la victima."
    Hechizos(7).PalabrasMagicas = "SUN VAP"
    Hechizos(7).HechizeroMsg = "Has lanzado flecha electrica sobre"
    Hechizos(7).PropioMsg = "Has lanzado flecha electrica sobre tí."
    Hechizos(7).TargetMsg = "lanzo flecha electrica sobre tí."
    Hechizos(7).FXgrh = 11
    Hechizos(7).ManaRequerido = 35
    Hechizos(7).MaxHP = 25
    Hechizos(7).MinHP = 15
    Hechizos(7).MinSkill = 22
    Hechizos(7).Resis = 1
    Hechizos(7).SubeHP = 2
    Hechizos(7).Target = 3
    Hechizos(7).Tipo = 1
    Hechizos(7).WAV = 16
    Hechizos(8).Nombre = "Misil mágico"
    Hechizos(8).Desc = "Causa 30 a 37 puntos de daño a la victima."
    Hechizos(8).PalabrasMagicas = "VAX IN TAR"
    Hechizos(8).HechizeroMsg = "Has lanzado misil magico sobre"
    Hechizos(8).PropioMsg = "Has lanzado misil magico sobre tí."
    Hechizos(8).TargetMsg = "lanzo misil magico sobre tí."
    Hechizos(8).FXgrh = 10
    Hechizos(8).Loops = 1
    Hechizos(8).ManaRequerido = 50
    Hechizos(8).MaxHP = 37
    Hechizos(8).MinHP = 30
    Hechizos(8).MinSkill = 38
    Hechizos(8).Resis = 1
    Hechizos(8).SubeHP = 2
    Hechizos(8).Target = 3
    Hechizos(8).Tipo = 1
    Hechizos(8).WAV = 16
    
    Hechizos(9).Nombre = "Paralizar"
    Hechizos(9).Desc = "Paraliza por un momento a la víctima."
    Hechizos(9).PalabrasMagicas = "HOAX VORP"
    Hechizos(9).HechizeroMsg = "Has paralizado a"
    Hechizos(9).PropioMsg = "Te has paralizado."
    Hechizos(9).TargetMsg = "te ha paralizado."
    Hechizos(9).FXgrh = 129
    Hechizos(9).Loops = 1
    Hechizos(9).ManaRequerido = 450
    Hechizos(9).MinSkill = 60
    Hechizos(9).Paraliza = 1
    Hechizos(9).Target = 3
    Hechizos(9).Tipo = 2
    Hechizos(9).WAV = 16
    
    Hechizos(10).Nombre = "Remover Parálisis"
    Hechizos(10).Desc = "Remueve la parálisis."
    Hechizos(10).PalabrasMagicas = "AN HOAX VORP"
    Hechizos(10).HechizeroMsg = "Le has removido la parálisis a"
    Hechizos(10).PropioMsg = "Te has removido la parálisis."
    Hechizos(10).TargetMsg = "te ha removido la parálisis."
    Hechizos(10).FXgrh = 123
    Hechizos(10).ManaRequerido = 300
    Hechizos(10).MinSkill = 45
    Hechizos(10).RemoverParalisis = 1
    Hechizos(10).Target = 3
    Hechizos(10).Tipo = 2
    Hechizos(10).WAV = 16
    
    Hechizos(11).Nombre = "Resucitar"
    Hechizos(11).Desc = "Resucitar un usuario muerto."
    Hechizos(11).PalabrasMagicas = "AHIL KNÄ XÄR"
    Hechizos(11).HechizeroMsg = "Has resucitado a"
    Hechizos(11).PropioMsg = "Te has resucitado."
    Hechizos(11).TargetMsg = "te ha resucitado."
    Hechizos(11).FXgrh = 72
    Hechizos(11).Loops = 1
    Hechizos(11).ManaRequerido = 420
    Hechizos(11).MinSkill = 75
    Hechizos(11).Revivir = 1
    Hechizos(11).Target = 1
    Hechizos(11).Tipo = 2
    Hechizos(11).WAV = 20
    
    Hechizos(12).Nombre = "Provocar hambre"
    Hechizos(12).Desc = "Provocar hambre, provoca la perdida de entre 20 y 50 pts de comida."
    Hechizos(12).PalabrasMagicas = "ÔL AEX"
    Hechizos(12).HechizeroMsg = "Le has lanzado hambre a"
    Hechizos(12).PropioMsg = "Te has lanzado el hechizo hambre."
    Hechizos(12).TargetMsg = "te ha lanzado el hechizo hambre."
    Hechizos(12).FXgrh = 28
    Hechizos(12).Loops = 1
    Hechizos(12).ManaRequerido = 20
    Hechizos(12).MaxHam = 50
    Hechizos(12).MinHam = 20
    Hechizos(12).MinSkill = 5
    Hechizos(12).Resis = 1
    Hechizos(12).SubeHam = 2
    Hechizos(12).Target = 1
    Hechizos(12).Tipo = 1
    Hechizos(12).WAV = 16
    
    Hechizos(13).Nombre = "Terrible hambre de Igôr"
    Hechizos(13).Desc = "Terrible hambre de Igôr, provoca dejar a la víctima con sólo 1 punto en hambre. Este encantamiento"
    Hechizos(13).PalabrasMagicas = "ÛX'ÔL AEX"
    Hechizos(13).HechizeroMsg = "Le has lanzado Hambre de Igor a"
    Hechizos(13).PropioMsg = "Te has lanzado el hechizo Hambre de Igor."
    Hechizos(13).TargetMsg = "te ha lanzado el hechizo Hambre de Igor."
    Hechizos(13).FXgrh = 28
    Hechizos(13).Loops = 1
    Hechizos(13).ManaRequerido = 55
    Hechizos(13).MaxHam = 100
    Hechizos(13).MinHam = 100
    Hechizos(13).MinSkill = 35
    Hechizos(13).Resis = 1
    Hechizos(13).SubeHam = 2
    Hechizos(13).Target = 1
    Hechizos(13).Tipo = 1
    Hechizos(13).WAV = 16
    Hechizos(14).Nombre = "Invisibilidad"
    Hechizos(14).Desc = "Vuelve invisible al target, efecto no permanente."
    Hechizos(14).PalabrasMagicas = "ROHL UX MAIO"
    Hechizos(14).HechizeroMsg = "Has lanzado invisibilidad sobre"
    Hechizos(14).PropioMsg = "Te has lanzado invisibilidad."
    Hechizos(14).TargetMsg = "lanzo invisibilidad sobre tí."
    Hechizos(14).Invisibilidad = 1
    Hechizos(14).ManaRequerido = 500
    Hechizos(14).MinSkill = 87
    Hechizos(14).Target = 1
    Hechizos(14).Tipo = 2
    Hechizos(14).WAV = 16
    Hechizos(15).Nombre = "Tormenta de fuego"
    Hechizos(15).Desc = "Causa 35 a 55 puntos de daño a la victima."
    Hechizos(15).PalabrasMagicas = "EN VAX ON TAR"
    Hechizos(15).HechizeroMsg = "Has lanzado Tormenta de fuego sobre"
    Hechizos(15).PropioMsg = "Has lanzado Tormenta de fuego sobre tí."
    Hechizos(15).TargetMsg = "lanzo Tormenta de fuego sobre tí."
    Hechizos(15).FXgrh = 7
    Hechizos(15).Loops = 1
    Hechizos(15).ManaRequerido = 250
    Hechizos(15).MaxHP = 55
    Hechizos(15).MinHP = 35
    Hechizos(15).MinSkill = 75
    Hechizos(15).Resis = 1
    Hechizos(15).SubeHP = 2
    Hechizos(15).Target = 3
    Hechizos(15).Tipo = 1
    Hechizos(15).WAV = 27
    Hechizos(16).Nombre = "Llamado a la naturaleza"
    Hechizos(16).Desc = "Implora ayuda a la madre naturaleza, tres lobos acudiran en tu ayuda."
    Hechizos(16).PalabrasMagicas = "Nature et worg"
    Hechizos(16).HechizeroMsg = "Has lanzado Llamado a la naturaleza"
    Hechizos(16).PropioMsg = ""
    Hechizos(16).TargetMsg = ""
    Hechizos(16).Cant = 3
    Hechizos(16).invoca = 1
    Hechizos(16).ManaRequerido = 120
    Hechizos(16).MinSkill = 40
    Hechizos(16).NumNpc = 545
    Hechizos(16).Target = 4
    Hechizos(16).Tipo = 4
    Hechizos(16).WAV = 17
    Hechizos(17).Nombre = "Invokar Zombies"
    Hechizos(17).Desc = "Invoca la ayuda del los muertos, tres zombies acudiran en tu ayuda."
    Hechizos(17).PalabrasMagicas = "MoÎ cámus"
    Hechizos(17).HechizeroMsg = "Has invocado tres Zombies"
    Hechizos(17).PropioMsg = ""
    Hechizos(17).TargetMsg = ""
    Hechizos(17).Cant = 3
    Hechizos(17).invoca = 1
    Hechizos(17).ManaRequerido = 220
    Hechizos(17).MinSkill = 70
    Hechizos(17).NumNpc = 546
    Hechizos(17).Target = 4
    Hechizos(17).Tipo = 4
    Hechizos(17).WAV = 17
    Hechizos(18).Nombre = "Celeridad"
    Hechizos(18).Desc = "Aumenta la agilidad del usuario que recibe el spell"
    Hechizos(18).PalabrasMagicas = "YUP A'INC"
    Hechizos(18).HechizeroMsg = "Has lanzado celeridad sobre "
    Hechizos(18).PropioMsg = "Has lanzado celeridad sobre tí."
    Hechizos(18).TargetMsg = "ha lanzado celeridad sobre tí."
    Hechizos(18).FXgrh = 37
    Hechizos(18).Loops = 1
    Hechizos(18).ManaRequerido = 50
    Hechizos(18).MaxAgilidad = 5
    Hechizos(18).MinAgilidad = 2
    Hechizos(18).MinSkill = 35
    Hechizos(18).SubeAgilidad = 1
    Hechizos(18).Target = 1
    Hechizos(18).Tipo = 1
    Hechizos(18).WAV = 17
    Hechizos(19).Nombre = "Torpeza"
    Hechizos(19).Desc = "Reduce la agilidad del usuario que recibe el spell"
    Hechizos(19).PalabrasMagicas = "ASYNC YUP A'INC"
    Hechizos(19).HechizeroMsg = "Has lanzado torpeza sobre "
    Hechizos(19).PropioMsg = "Has lanzado torpeza sobre tí."
    Hechizos(19).TargetMsg = "ha lanzado torpeza sobre tí."
    Hechizos(19).FXgrh = 28
    Hechizos(19).Loops = 1
    Hechizos(19).ManaRequerido = 50
    Hechizos(19).MaxAgilidad = 5
    Hechizos(19).MinAgilidad = 2
    Hechizos(19).MinSkill = 20
    Hechizos(19).SubeAgilidad = 2
    Hechizos(19).Target = 1
    Hechizos(19).Tipo = 1
    Hechizos(19).WAV = 17
    Hechizos(20).Nombre = "Fuerza"
    Hechizos(20).Desc = "Aumenta la fuerza del objetivo"
    Hechizos(20).PalabrasMagicas = "Ar A'kron"
    Hechizos(20).HechizeroMsg = "Has lanzado fuerza sobre "
    Hechizos(20).PropioMsg = "Has lanzado fuerza sobre tí."
    Hechizos(20).TargetMsg = "ha lanzado fuerza sobre tí."
    Hechizos(20).FXgrh = 83
    Hechizos(20).Loops = 3
    Hechizos(20).ManaRequerido = 50
    Hechizos(20).MaxFuerza = 5
    Hechizos(20).MinFuerza = 2
    Hechizos(20).MinSkill = 35
    Hechizos(20).SubeFuerza = 1
    Hechizos(20).Target = 1
    Hechizos(20).Tipo = 1
    Hechizos(20).WAV = 17
    Hechizos(21).Nombre = "Debilidad"
    Hechizos(21).Desc = "Reduce la fuerza del usuario que recibe el spell"
    Hechizos(21).PalabrasMagicas = "Xoom varp"
    Hechizos(21).HechizeroMsg = "Has lanzado Debilidad sobre "
    Hechizos(21).PropioMsg = "Has lanzado Debilidad sobre tí."
    Hechizos(21).TargetMsg = "ha lanzado Debilidad sobre tí."
    Hechizos(21).FXgrh = 28
    Hechizos(21).Loops = 1
    Hechizos(21).ManaRequerido = 45
    Hechizos(21).MaxFuerza = 5
    Hechizos(21).MinFuerza = 2
    Hechizos(21).MinSkill = 35
    Hechizos(21).SubeFuerza = 2
    Hechizos(21).Target = 1
    Hechizos(21).Tipo = 1
    Hechizos(21).WAV = 17
    Hechizos(22).Nombre = "Fuerza II"
    Hechizos(22).Desc = "Aumenta la fuerza del objetivo"
    Hechizos(22).PalabrasMagicas = "Ar A'kron II"
    Hechizos(22).HechizeroMsg = "Has lanzado fuerza II sobre "
    Hechizos(22).PropioMsg = "Has lanzado fuerza II sobre tí."
    Hechizos(22).TargetMsg = "ha lanzado fuerza II sobre tí."
    Hechizos(22).FXgrh = 83
    Hechizos(22).Loops = 3
    Hechizos(22).ManaRequerido = 75
    Hechizos(22).MaxFuerza = 15
    Hechizos(22).MinFuerza = 10
    Hechizos(22).MinSkill = 60
    Hechizos(22).SubeFuerza = 1
    Hechizos(22).Target = 1
    Hechizos(22).Tipo = 1
    Hechizos(22).WAV = 17
    Hechizos(23).Nombre = "Descarga electrica"
    Hechizos(23).Desc = "Causa 45 a 65 puntos de daño a la victima."
    Hechizos(23).PalabrasMagicas = "T'HY KOOOL"
    Hechizos(23).HechizeroMsg = "Has lanzado Descarga electrica sobre"
    Hechizos(23).PropioMsg = "Has lanzado Descarga electrica sobre tí."
    Hechizos(23).TargetMsg = "lanzo Descarga electrica tí."
    Hechizos(23).FXgrh = 121
    Hechizos(23).Loops = 1
    Hechizos(23).ManaRequerido = 350
    Hechizos(23).MaxHP = 65
    Hechizos(23).MinHP = 45
    Hechizos(23).MinSkill = 75
    Hechizos(23).Resis = 1
    Hechizos(23).SubeHP = 2
    Hechizos(23).Target = 3
    Hechizos(23).Tipo = 1
    Hechizos(23).WAV = 108
    Hechizos(24).Nombre = "Parálisis De Odin"
    Hechizos(24).Desc = "Paraliza por un momento a la victima."
    Hechizos(24).PalabrasMagicas = "HOAX VORP AR ZONE"
    Hechizos(24).HechizeroMsg = "Has paralizado a"
    Hechizos(24).PropioMsg = "Te has paralizado."
    Hechizos(24).TargetMsg = "te ha paralizado."
    Hechizos(24).FXgrh = 8
    Hechizos(24).Loops = 1
    Hechizos(24).ManaRequerido = 2000
    Hechizos(24).MinSkill = 170
    Hechizos(24).MinNivel = 40
    Hechizos(24).Paralizaarea = 1
    Hechizos(24).Target = 2
    Hechizos(24).Tipo = 2
    Hechizos(24).WAV = 16
    Hechizos(25).Nombre = "Apocalipsis"
    Hechizos(25).Desc = "Causa 75 a 80 puntos de daño a la victima."
    Hechizos(25).PalabrasMagicas = "Rahma Nañarak O'al"
    Hechizos(25).HechizeroMsg = "Has lanzado Apocalipsis sobre"
    Hechizos(25).PropioMsg = "Has lanzado Apocalipsis sobre tí."
    Hechizos(25).TargetMsg = "lanzo Apocalipsis tí."
    Hechizos(25).FXgrh = 13
    Hechizos(25).Loops = 1
    Hechizos(25).ManaRequerido = 640
    Hechizos(25).MaxHP = 85
    Hechizos(25).MinHP = 80
    Hechizos(25).MinSkill = 110
    Hechizos(25).Resis = 1
    Hechizos(25).SubeHP = 2
    Hechizos(25).Target = 3
    Hechizos(25).Tipo = 1
    Hechizos(25).WAV = 27
    Hechizos(26).Nombre = "Invocar elemental de fuego"
    Hechizos(26).Desc = "Invocar elemental de fuego"
    Hechizos(26).PalabrasMagicas = "Yur'rax"
    Hechizos(26).HechizeroMsg = "Has invocado un elemental de fuego"
    Hechizos(26).PropioMsg = ""
    Hechizos(26).TargetMsg = ""
    Hechizos(26).Cant = 1
    Hechizos(26).invoca = 1
    Hechizos(26).ManaRequerido = 620
    Hechizos(26).MinSkill = 100
    Hechizos(26).NumNpc = 93
    Hechizos(26).Target = 4
    Hechizos(26).Tipo = 4
    Hechizos(26).WAV = 17
    Hechizos(27).Nombre = "Invocar elemental de agua"
    Hechizos(27).Desc = "Invocar elemental de agua"
    Hechizos(27).PalabrasMagicas = "Mantra'rax"
    Hechizos(27).HechizeroMsg = "Has invocado un elemental de agua"
    Hechizos(27).PropioMsg = ""
    Hechizos(27).TargetMsg = ""
    Hechizos(27).Cant = 1
    Hechizos(27).invoca = 1
    Hechizos(27).ManaRequerido = 620
    Hechizos(27).MinSkill = 100
    Hechizos(27).NumNpc = 92
    Hechizos(27).Target = 4
    Hechizos(27).Tipo = 4
    Hechizos(27).WAV = 17
    Hechizos(28).Nombre = "Invocar elemental de tierra"
    Hechizos(28).Desc = "Invocar elemental de tierra"
    Hechizos(28).PalabrasMagicas = "Roc'rax"
    Hechizos(28).HechizeroMsg = "Has invocado un elemental de tierra"
    Hechizos(28).PropioMsg = ""
    Hechizos(28).TargetMsg = ""
    Hechizos(28).Cant = 1
    Hechizos(28).invoca = 1
    Hechizos(28).ManaRequerido = 620
    Hechizos(28).MinSkill = 100
    Hechizos(28).NumNpc = 94
    Hechizos(28).Target = 4
    Hechizos(28).Tipo = 4
    Hechizos(28).WAV = 17
    Hechizos(29).Nombre = "Invocar Cerbero"
    Hechizos(29).Desc = "Invocar Cerbero"
    Hechizos(29).PalabrasMagicas = "InF Cerb'RoX"
    Hechizos(29).HechizeroMsg = "Has implorado ayuda a los dioses!"
    Hechizos(29).PropioMsg = ""
    Hechizos(29).TargetMsg = ""
    Hechizos(29).Cant = 1
    Hechizos(29).invoca = 1
    Hechizos(29).ManaRequerido = 1820
    Hechizos(29).MinSkill = 150
    Hechizos(29).NumNpc = 259
    Hechizos(29).Target = 4
    Hechizos(29).Tipo = 4
    Hechizos(29).WAV = 17
    Hechizos(30).Nombre = "Ceguera"
    Hechizos(30).Desc = "Ceguera"
    Hechizos(30).PalabrasMagicas = ""
    Hechizos(30).HechizeroMsg = "Has lanzado ceguera sobre"
    Hechizos(30).PropioMsg = "Has lanzado ceguera sobre tí."
    Hechizos(30).TargetMsg = "lanzo ceguera tí."
    Hechizos(30).Ceguera = 1
    Hechizos(30).FXgrh = 95
    Hechizos(30).ManaRequerido = 620
    Hechizos(30).MinSkill = 70
    Hechizos(30).Target = 1
    Hechizos(30).Tipo = 2
    Hechizos(30).WAV = 17
    Hechizos(31).Nombre = "Estupidez"
    Hechizos(31).Desc = "Estupidez"
    Hechizos(31).PalabrasMagicas = ""
    Hechizos(31).HechizeroMsg = "Has lanzado Estupidez sobre"
    Hechizos(31).PropioMsg = "Has lanzado Estupidez sobre tí."
    Hechizos(31).TargetMsg = "lanzo Estupidez sobre tí."
    Hechizos(31).Estupidez = 1
    Hechizos(31).FXgrh = 95
    Hechizos(31).Loops = 3
    Hechizos(31).ManaRequerido = 620
    Hechizos(31).MinSkill = 70
    Hechizos(31).Target = 1
    Hechizos(31).Tipo = 2
    Hechizos(31).WAV = 17
    Hechizos(32).Nombre = "Curación Milagrosa"
    Hechizos(32).Desc = "Curar heridas muy graves, restaura entre 150 y 200 puntos de salud."
    Hechizos(32).PalabrasMagicas = "SANCTIS DEUS"
    Hechizos(32).HechizeroMsg = "Has sanado a"
    Hechizos(32).PropioMsg = "Te has curado muchas heridas."
    Hechizos(32).TargetMsg = "te ha curado muchas heridas."
    Hechizos(32).FXgrh = 31
    Hechizos(32).Loops = 1
    Hechizos(32).ManaRequerido = 500
    Hechizos(32).MaxHP = 200
    Hechizos(32).MinHP = 150
    Hechizos(32).MinSkill = 130
    Hechizos(32).SubeHP = 1
    Hechizos(32).Target = 3
    Hechizos(32).Tipo = 1
    Hechizos(32).WAV = 18
    Hechizos(33).Nombre = "MINIApocalipsis"
    Hechizos(33).Desc = "Causa 65 a 70 puntos de daño a la victima."
    Hechizos(33).PalabrasMagicas = "RôaM ShArek"
    Hechizos(33).HechizeroMsg = "Has lanzado MINIApocalipsis sobre"
    Hechizos(33).PropioMsg = "Has lanzado MINIApocalipsis sobre tí."
    Hechizos(33).TargetMsg = "lanzo MINIApocalipsis tí."
    Hechizos(33).FXgrh = 93
    Hechizos(33).Loops = 1
    Hechizos(33).ManaRequerido = 399
    Hechizos(33).MaxHP = 70
    Hechizos(33).MinHP = 65
    Hechizos(33).MinSkill = 60
    Hechizos(33).Resis = 1
    Hechizos(33).SubeHP = 2
    Hechizos(33).Target = 3
    Hechizos(33).Tipo = 1
    Hechizos(33).WAV = 27
    Hechizos(34).Nombre = "Rayo GM"
    Hechizos(34).Desc = "Causa 9000 puntos de daño a la victima."
    Hechizos(34).PalabrasMagicas = "RÂC U MAS"
    Hechizos(34).HechizeroMsg = "Has lanzado Rayo GM sobre"
    Hechizos(34).PropioMsg = ""
    Hechizos(34).TargetMsg = "lanzo muerte sobre tí."
    Hechizos(34).FXgrh = 15
    Hechizos(34).Loops = 3
    Hechizos(34).MaxHP = 9000
    Hechizos(34).MinHP = 9000
    Hechizos(34).Resis = 1
    Hechizos(34).SubeHP = 2
    Hechizos(34).Target = 3
    Hechizos(34).Tipo = 1
    Hechizos(34).WAV = 16
    Hechizos(35).Nombre = "Bomba de Humo"
    Hechizos(35).Desc = "ceguera , estupidez "
    Hechizos(35).PalabrasMagicas = "MâC Smoke"
    Hechizos(35).HechizeroMsg = "Has lanzado Bomba de Humo sobre"
    Hechizos(35).PropioMsg = "Has lanzado Bomba de Humo sobre tí."
    Hechizos(35).TargetMsg = "lanzo Bomba de Humo sobre tí."
    Hechizos(35).Ceguera = 1
    Hechizos(35).Estupidez = 1
    Hechizos(35).FXgrh = 74
    Hechizos(35).Loops = 2
    Hechizos(35).ManaRequerido = 700
    Hechizos(35).MinSkill = 70
    Hechizos(35).Target = 1
    Hechizos(35).Tipo = 2
    Hechizos(35).WAV = 17
    Hechizos(36).Nombre = "Invocar Super Elemental De Cristal"
    Hechizos(36).Desc = "Invocar Super Elemental De Cristal"
    Hechizos(36).PalabrasMagicas = "RaôC Thü"
    Hechizos(36).HechizeroMsg = "Has invocado un Super Elemental De Cristal"
    Hechizos(36).PropioMsg = ""
    Hechizos(36).TargetMsg = ""
    Hechizos(36).Cant = 1
    Hechizos(36).invoca = 1
    Hechizos(36).ManaRequerido = 1800
    Hechizos(36).MinSkill = 200
    Hechizos(36).MinNivel = 40
    Hechizos(36).NumNpc = 107
    Hechizos(36).Target = 4
    Hechizos(36).Tipo = 4
    Hechizos(36).WAV = 17
    Hechizos(37).Nombre = "Poder Divino"
    Hechizos(37).Desc = "Resucitar un usuario muerto."
    Hechizos(37).PalabrasMagicas = "AHIL KNÄ XÄR"
    Hechizos(37).HechizeroMsg = "Has resucitado a"
    Hechizos(37).PropioMsg = "Te has resucitado."
    Hechizos(37).TargetMsg = "te ha resucitado."
    Hechizos(37).FXgrh = 72
    Hechizos(37).Revivir = 1
    Hechizos(37).Target = 1
    Hechizos(37).Tipo = 2
    Hechizos(37).WAV = 20
    Hechizos(38).Nombre = "Ira De Dios"
    Hechizos(38).Desc = "Causa 150 a 180 puntos de daño a todos en el área."
    Hechizos(38).PalabrasMagicas = "DEUS EX MACHINA"
    Hechizos(38).HechizeroMsg = "Has lanzado Irá De Dios sobre"
    Hechizos(38).PropioMsg = "Has lanzado Irá De Dios sobre tí."
    Hechizos(38).TargetMsg = "lanzo Irá De Dios tí."
    Hechizos(38).FXgrh = 20
    Hechizos(38).Loops = 1
    Hechizos(38).MaxHP = 180
    Hechizos(38).MinHP = 150
    Hechizos(38).Resis = 1
    Hechizos(38).SubeHP = 4
    Hechizos(38).Target = 3
    Hechizos(38).Tipo = 1
    Hechizos(38).WAV = 27
    Hechizos(39).Nombre = "Curacion Divina"
    Hechizos(39).Desc = "Sana completamente, restaura la sed y el hambre."
    Hechizos(39).PalabrasMagicas = "SANCTIS CORPUS"
    Hechizos(39).HechizeroMsg = "Has sanado a"
    Hechizos(39).PropioMsg = "Te has curado algunas heridas."
    Hechizos(39).TargetMsg = "te ha curado algunas heridas."
    Hechizos(39).FXgrh = 106
    Hechizos(39).Loops = 1
    Hechizos(39).ManaRequerido = 1000
    Hechizos(39).MaxHam = 500
    Hechizos(39).MaxHP = 550
    Hechizos(39).MaxSed = 1500
    Hechizos(39).MinHam = 500
    Hechizos(39).MinHP = 550
    Hechizos(39).MinSed = 1500
    Hechizos(39).MinSkill = 130
    Hechizos(39).SubeHam = 1
    Hechizos(39).SubeHP = 1
    Hechizos(39).SubeSed = 1
    Hechizos(39).Target = 1
    Hechizos(39).Tipo = 1
    Hechizos(39).WAV = 18
    Hechizos(40).Nombre = "Celeridad II"
    Hechizos(40).Desc = "Aumenta la agilidad del usuario que recibe el spell"
    Hechizos(40).PalabrasMagicas = "YUP A'INC II"
    Hechizos(40).HechizeroMsg = "Has lanzado celeridad II sobre "
    Hechizos(40).PropioMsg = "Has lanzado celeridad II sobre tí."
    Hechizos(40).TargetMsg = "ha lanzado celeridad II sobre tí."
    Hechizos(40).FXgrh = 37
    Hechizos(40).ManaRequerido = 75
    Hechizos(40).MaxAgilidad = 15
    Hechizos(40).MinAgilidad = 10
    Hechizos(40).MinSkill = 60
    Hechizos(40).SubeAgilidad = 1
    Hechizos(40).Target = 1
    Hechizos(40).Tipo = 1
    Hechizos(40).WAV = 17
    Hechizos(41).Nombre = "Implosión"
    Hechizos(41).Desc = "Causa 120 a 130 puntos de daño a las victimas cercanas al lanzador."
    Hechizos(41).PalabrasMagicas = "IMPLO'BUMX "
    Hechizos(41).HechizeroMsg = "Has lanzado Implosión sobre"
    Hechizos(41).PropioMsg = "Has lanzado Implosión sobre tí."
    Hechizos(41).TargetMsg = "lanzo Implosión tí."
    Hechizos(41).FXgrh = 23
    Hechizos(41).Loops = 1
    Hechizos(41).ManaRequerido = 2000
    Hechizos(41).MaxHP = 130
    Hechizos(41).MinHP = 120
    Hechizos(41).MinSkill = 200
    Hechizos(41).MinNivel = 40
    Hechizos(41).Resis = 1
    Hechizos(41).SubeHP = 3
    Hechizos(41).Target = 3
    Hechizos(41).Tipo = 1
    Hechizos(41).WAV = 27
    Hechizos(42).Nombre = "Curar Heridas Críticas"
    Hechizos(42).Desc = "Curar heridas críticas, restaura entre 45 y 70 puntos de salud."
    Hechizos(42).PalabrasMagicas = "EN CORP'CRI SANCTIS"
    Hechizos(42).HechizeroMsg = "Has sanado a"
    Hechizos(42).PropioMsg = "Te has curado bastantes heridas."
    Hechizos(42).TargetMsg = "te ha curado bastantes heridas."
    Hechizos(42).FXgrh = 31
    Hechizos(42).Loops = 1
    Hechizos(42).ManaRequerido = 150
    Hechizos(42).MaxHP = 70
    Hechizos(42).MinHP = 45
    Hechizos(42).MinSkill = 80
    Hechizos(42).SubeHP = 1
    Hechizos(42).Target = 3
    Hechizos(42).Tipo = 1
    Hechizos(42).WAV = 18
    Hechizos(43).Nombre = "Polymorph Animal"
    Hechizos(43).Desc = "Te transformas en otras criaturas."
    Hechizos(43).PalabrasMagicas = "MORPH^TRANSF ANIMAL"
    Hechizos(43).HechizeroMsg = "Has transformado a"
    Hechizos(43).PropioMsg = "Te has transformado."
    Hechizos(43).TargetMsg = "te ha tranformado."
    Hechizos(43).FXgrh = 25
    Hechizos(43).Loops = 2
    Hechizos(43).ManaRequerido = 2000
    Hechizos(43).MinSkill = 100
    Hechizos(43).Morph = 1
    Hechizos(43).MinNivel = 40
    Hechizos(43).Target = 1
    Hechizos(43).Tipo = 2
    Hechizos(43).WAV = 109
    Hechizos(44).Nombre = "LLuvia de Sangre"
    Hechizos(44).Desc = "Causa 85 a 95 puntos de daño a la victima."
    Hechizos(44).PalabrasMagicas = "XUV FO SAN'G"
    Hechizos(44).HechizeroMsg = "Has lanzado Lluvia de Sangre sobre"
    Hechizos(44).PropioMsg = "Has lanzado Lluvia de Sangre sobre tí."
    Hechizos(44).TargetMsg = "lanzo LLuvia de Sangre sobre tí."
    Hechizos(44).FXgrh = 26
    Hechizos(44).Loops = 1
    Hechizos(44).ManaRequerido = 840
    Hechizos(44).MaxHP = 100
    Hechizos(44).MinHP = 85
    Hechizos(44).MinSkill = 150
    Hechizos(44).MinNivel = 30
    Hechizos(44).Resis = 1
    Hechizos(44).SubeHP = 2
    Hechizos(44).Target = 3
    Hechizos(44).Tipo = 1
    Hechizos(44).WAV = 27
    Hechizos(45).Nombre = "Llama de Dragon"
    Hechizos(45).Desc = "Causa 105 a 115 puntos de daño a la victima."
    Hechizos(45).PalabrasMagicas = " ALLÂH U DRAK"
    Hechizos(45).HechizeroMsg = "Has lanzado Llama de Dragon sobre"
    Hechizos(45).PropioMsg = "Has lanzado Llama de Dragon sobre tí."
    Hechizos(45).TargetMsg = "lanzo Llama de Dragon tí."
    Hechizos(45).FXgrh = 19
    Hechizos(45).Loops = 1
    Hechizos(45).ManaRequerido = 1000
    Hechizos(45).MaxHP = 110
    Hechizos(45).MinHP = 105
    Hechizos(45).MinSkill = 200
    Hechizos(45).MinNivel = 40
    Hechizos(45).Resis = 1
    Hechizos(45).SubeHP = 2
    Hechizos(45).Target = 3
    Hechizos(45).Tipo = 1
    Hechizos(45).WAV = 27
    Hechizos(46).Nombre = "Disparo Toxico"
    Hechizos(46).Desc = "Envenenamiento, provoca la muerte si no se contraresta el veneno."
    Hechizos(46).PalabrasMagicas = "SERP DISP"
    Hechizos(46).HechizeroMsg = "Has envenenado a"
    Hechizos(46).PropioMsg = "Te has envenenado."
    Hechizos(46).TargetMsg = "te ha envenenado."
    Hechizos(46).Envenena = 15
    Hechizos(46).FXgrh = 75
    Hechizos(46).Loops = 1
    Hechizos(46).ManaRequerido = 250
    Hechizos(46).MinSkill = 0
    Hechizos(46).Resis = 1
    Hechizos(46).Target = 1
    Hechizos(46).Tipo = 2
    Hechizos(46).WAV = 47
    Hechizos(47).Nombre = "Invocar Hada"
    Hechizos(47).Desc = "Invoca un Hada con poderosa magia de ataque."
    Hechizos(47).PalabrasMagicas = "Hada Duntra'rax"
    Hechizos(47).HechizeroMsg = "Has convocado un Hada!"
    Hechizos(47).PropioMsg = ""
    Hechizos(47).TargetMsg = ""
    Hechizos(47).Cant = 1
    Hechizos(47).invoca = 1
    Hechizos(47).ManaRequerido = 1820
    Hechizos(47).MinSkill = 180
    Hechizos(47).MinNivel = 30
    Hechizos(47).NumNpc = 129
    Hechizos(47).Target = 4
    Hechizos(47).Tipo = 4
    Hechizos(47).WAV = 47
    Hechizos(48).Nombre = "Invocar Genio"
    Hechizos(48).Desc = "Invoca un Genio con poderosa magia de ataque."
    Hechizos(48).PalabrasMagicas = "Genius Duntra'rax"
    Hechizos(48).HechizeroMsg = "Has convocado un Genio!"
    Hechizos(48).PropioMsg = ""
    Hechizos(48).TargetMsg = ""
    Hechizos(48).Cant = 1
    Hechizos(48).invoca = 1
    Hechizos(48).ManaRequerido = 2300
    Hechizos(48).MinSkill = 200
    Hechizos(48).MinNivel = 45
    Hechizos(48).NumNpc = 130
    Hechizos(48).Target = 4
    Hechizos(48).Tipo = 4
    Hechizos(48).WAV = 47
    Hechizos(49).Nombre = "Enredar"
    Hechizos(49).Desc = "Enreda por un momento a la victima."
    Hechizos(49).PalabrasMagicas = "HOAX PLANT"
    Hechizos(49).HechizeroMsg = "Has enredado a"
    Hechizos(49).PropioMsg = "Te has enredado."
    Hechizos(49).TargetMsg = "te ha enredado."
    Hechizos(49).FXgrh = 103
    Hechizos(49).Loops = 2
    Hechizos(49).MinSkill = 60
    Hechizos(49).Paraliza = 1
    Hechizos(49).Target = 3
    Hechizos(49).Tipo = 2
    Hechizos(49).WAV = 26
    Hechizos(50).Nombre = "Onda de Luz"
    Hechizos(50).Desc = "Causa 70 a 78 puntos de daño a la victima."
    Hechizos(50).PalabrasMagicas = "ONX DE VI'T"
    Hechizos(50).HechizeroMsg = "Has lanzado Onda Luz sobre"
    Hechizos(50).PropioMsg = "Has Onda Luz sobre tí."
    Hechizos(50).TargetMsg = "lanzo Onda Luz sobre tí."
    Hechizos(50).FXgrh = 27
    Hechizos(50).Loops = 1
    Hechizos(50).ManaRequerido = 110
    Hechizos(50).MaxHP = 78
    Hechizos(50).MinHP = 70
    Hechizos(50).MinSkill = 125
    Hechizos(50).MinNivel = 30
    Hechizos(50).Resis = 1
    Hechizos(50).SubeHP = 2
    Hechizos(50).Target = 2
    Hechizos(50).Tipo = 1
    Hechizos(50).WAV = 16
    Hechizos(51).Nombre = "Llamarada"
    Hechizos(51).Desc = "Causa 75 a 80 puntos de daño a la victima."
    Hechizos(51).PalabrasMagicas = "AMX FOX FI'R"
    Hechizos(51).HechizeroMsg = "Has lanzado Llamarada sobre"
    Hechizos(51).PropioMsg = "Has lanzado Llamarada sobre tí."
    Hechizos(51).TargetMsg = "lanzo Llamarada sobre tí."
    Hechizos(51).FXgrh = 22
    Hechizos(51).Loops = 1
    Hechizos(51).ManaRequerido = 400
    Hechizos(51).MaxHP = 80
    Hechizos(51).MinHP = 75
    Hechizos(51).MinSkill = 110
    Hechizos(51).Resis = 1
    Hechizos(51).SubeHP = 2
    Hechizos(51).Target = 3
    Hechizos(51).Tipo = 1
    Hechizos(51).WAV = 107
    Hechizos(52).Nombre = "Reavivar Sangre"
    Hechizos(52).Desc = "Aumenta la fuerza y Agilidad"
    Hechizos(52).PalabrasMagicas = "A'kron + A'INC"
    Hechizos(52).HechizeroMsg = "Has lanzado Reavivar Sangre sobre "
    Hechizos(52).PropioMsg = "Has lanzado Reavivar Sangre sobre tí."
    Hechizos(52).TargetMsg = "ha lanzado Reavivar Sangre sobre tí."
    Hechizos(52).FXgrh = 29
    Hechizos(52).MaxAgilidad = 15
    Hechizos(52).MaxFuerza = 15
    Hechizos(52).MinAgilidad = 10
    Hechizos(52).MinFuerza = 10
    Hechizos(52).SubeAgilidad = 1
    Hechizos(52).SubeFuerza = 1
    Hechizos(52).Target = 1
    Hechizos(52).Tipo = 1
    Hechizos(52).WAV = 17
    Hechizos(53).Nombre = "Poder De Lucifer"
    Hechizos(53).Desc = "Causa 150 a 180 puntos de daño a todos en el área."
    Hechizos(53).PalabrasMagicas = " URUK UNGOL"
    Hechizos(53).HechizeroMsg = "Has lanzado Poder De Lucifer sobre"
    Hechizos(53).PropioMsg = "Has lanzado Poder De Lucifer sobre tí."
    Hechizos(53).TargetMsg = "lanzo Poder De Lucifer tí."
    Hechizos(53).FXgrh = 22
    Hechizos(53).Loops = 4
    Hechizos(53).MaxHP = 180
    Hechizos(53).MinHP = 150
    Hechizos(53).Resis = 1
    Hechizos(53).SubeHP = 4
    Hechizos(53).Target = 3
    Hechizos(53).Tipo = 1
    Hechizos(53).WAV = 107
    Hechizos(54).Nombre = ""
    Hechizos(54).Desc = ""
    Hechizos(54).PalabrasMagicas = ""
    Hechizos(54).HechizeroMsg = ""
    Hechizos(54).PropioMsg = ""
    Hechizos(54).TargetMsg = ""
    Hechizos(55).Nombre = "Detectar invisibilidad"
    Hechizos(55).Desc = "Remueve parcialmente los efectos de la invisibilidad"
    Hechizos(55).PalabrasMagicas = "An MaÏo naq vïká"
    Hechizos(55).HechizeroMsg = "Has lanzado detectar invisibilidad"
    Hechizos(55).PropioMsg = "Te ha lanzado detectar invisibilidad"
    Hechizos(55).TargetMsg = "Detectas la invisibilidad alrededor tuyo."
    Hechizos(55).FXgrh = 23
    Hechizos(55).Loops = 7
    Hechizos(55).MinSkill = 100
    Hechizos(55).Target = 3
    Hechizos(55).Tipo = 2
    Hechizos(55).WAV = 16
    Hechizos(55).RemueveInvisibilidadParcial = 1
    Hechizos(55).ManaRequerido = 400
    Hechizos(55).Target = 4
    Hechizos(56).Nombre = "Repone Mana II"
    Hechizos(56).Desc = "Repone Mana"
    Hechizos(56).PalabrasMagicas = "CORP MANA"
    Hechizos(56).HechizeroMsg = "Has resturado mana a"
    Hechizos(56).PropioMsg = "Te has restaurado mana."
    Hechizos(56).TargetMsg = "te ha restaurado mana."
    Hechizos(56).MaMana = 60
    Hechizos(56).MiMana = 25
    Hechizos(56).SubeMana = 1
    Hechizos(56).Target = 3
    Hechizos(56).Tipo = 1
    Hechizos(56).WAV = 17
    Hechizos(57).Nombre = "Aura Protectora  "
    Hechizos(57).Desc = "Barrera Mágica que protege de golpes."
    Hechizos(57).PalabrasMagicas = "AURO PROT"
    Hechizos(57).HechizeroMsg = "Has protegido a"
    Hechizos(57).PropioMsg = "Te has protegido."
    Hechizos(57).TargetMsg = "te ha protegido."
    Hechizos(57).FXgrh = 91
    Hechizos(57).Loops = 1
    Hechizos(57).WAV = 16
    Hechizos(58).Nombre = "Aura Protectora II "
    Hechizos(58).Desc = "Barrera Mágica que protege de golpes."
    Hechizos(58).PalabrasMagicas = "AURO PROT MEX"
    Hechizos(58).HechizeroMsg = "Has protegido a"
    Hechizos(58).PropioMsg = "Te has protegido."
    Hechizos(58).TargetMsg = "te ha protegido."
    Hechizos(58).FXgrh = 109
    Hechizos(58).Loops = 1
    Hechizos(58).WAV = 16
    Hechizos(59).Nombre = "Arco Iris "
    Hechizos(59).Desc = ""
    Hechizos(59).PalabrasMagicas = ""
    Hechizos(59).HechizeroMsg = ""
    Hechizos(59).PropioMsg = ""
    Hechizos(59).TargetMsg = ""
    Hechizos(59).FXgrh = 92
    Hechizos(59).Loops = 2
    Hechizos(59).SubeHP = 2
    Hechizos(59).WAV = 16
    Hechizos(60).Nombre = "Restauración"
    Hechizos(60).Desc = "Restaura entre 125 y 175 puntos de salud."
    Hechizos(60).PalabrasMagicas = "REST CORP SANC"
    Hechizos(60).HechizeroMsg = "Has sanado a"
    Hechizos(60).PropioMsg = "Te has curado algunas heridas."
    Hechizos(60).TargetMsg = "te ha curado algunas heridas."
    Hechizos(60).FXgrh = 116
    Hechizos(60).Loops = 1
    Hechizos(60).ManaRequerido = 400
    Hechizos(60).MaxHP = 175
    Hechizos(60).MinHP = 125
    Hechizos(60).MinSkill = 90
    Hechizos(60).SubeHP = 1
    Hechizos(60).Target = 3
    Hechizos(60).Tipo = 1
    Hechizos(60).WAV = 17
    Hechizos(61).Nombre = "Incinerar"
    Hechizos(61).Desc = "Causa 100 a 105 puntos de daño a la victima."
    Hechizos(61).PalabrasMagicas = "FIRE 'AHC HUMUS"
    Hechizos(61).HechizeroMsg = "Has lanzado Incinerar sobre"
    Hechizos(61).PropioMsg = "Has lanzado Incinerar sobre tí."
    Hechizos(61).TargetMsg = "lanzo Incinerar sobre tí."
    Hechizos(61).FXgrh = 113
    Hechizos(61).Loops = 1
    Hechizos(61).ManaRequerido = 840
    Hechizos(61).MaxHP = 105
    Hechizos(61).MinHP = 100
    Hechizos(61).MinSkill = 150
    Hechizos(61).MinNivel = 30
    Hechizos(61).Resis = 1
    Hechizos(61).SubeHP = 2
    Hechizos(61).Target = 3
    Hechizos(61).Tipo = 1
    Hechizos(61).WAV = 27
    Hechizos(62).Nombre = "Ventisca"
    Hechizos(62).Desc = "Causa 80 a 100 puntos de daño a la victima."
    Hechizos(62).PalabrasMagicas = "WÎND 'AHC RAI"
    Hechizos(62).HechizeroMsg = "Has lanzado Ventisca sobre"
    Hechizos(62).PropioMsg = "Has lanzado Ventisca sobre tí."
    Hechizos(62).TargetMsg = "lanzo Ventisca sobre tí."
    Hechizos(62).FXgrh = 114
    Hechizos(62).Loops = 1
    Hechizos(62).ManaRequerido = 840
    Hechizos(62).MaxHP = 100
    Hechizos(62).MinHP = 80
    Hechizos(62).MinSkill = 150
    Hechizos(62).MinNivel = 30
    Hechizos(62).Resis = 1
    Hechizos(62).SubeHP = 2
    Hechizos(62).Target = 3
    Hechizos(62).Tipo = 1
    Hechizos(62).WAV = 27
    Hechizos(63).Nombre = "Rayo de Fuego"
    Hechizos(63).Desc = "Causa 35 a 55 puntos de daño a la victima."
    Hechizos(63).PalabrasMagicas = "RAX FOX FI'R"
    Hechizos(63).HechizeroMsg = "Has lanzado Rayo de Fuego sobre"
    Hechizos(63).PropioMsg = "Has lanzado Rayo de Fuego sobre tí."
    Hechizos(63).TargetMsg = "lanzo Rayo de Fuego sobre tí."
    Hechizos(63).FXgrh = 115
    Hechizos(63).Loops = 2
    Hechizos(63).ManaRequerido = 250
    Hechizos(63).MaxHP = 55
    Hechizos(63).MinHP = 35
    Hechizos(63).MinSkill = 75
    Hechizos(63).Resis = 1
    Hechizos(63).SubeHP = 2
    Hechizos(63).Target = 3
    Hechizos(63).Tipo = 1
    Hechizos(63).WAV = 107
    Hechizos(64).Nombre = "Rayo Eléctrico"
    Hechizos(64).Desc = "Causa 85 a 125 puntos de daño a la victima."
    Hechizos(64).PalabrasMagicas = "RAX ELEC'X"
    Hechizos(64).HechizeroMsg = "Has lanzado Rayo Eléctrico sobre"
    Hechizos(64).PropioMsg = "Has lanzado Rayo Eléctrico sobre tí."
    Hechizos(64).TargetMsg = "lanzo Rayo Eléctrico sobre tí."
    Hechizos(64).FXgrh = 110
    Hechizos(64).Loops = 2
    Hechizos(64).ManaRequerido = 350
    Hechizos(64).MaxHP = 65
    Hechizos(64).MinHP = 45
    Hechizos(64).MinSkill = 75
    Hechizos(64).Resis = 1
    Hechizos(64).SubeHP = 2
    Hechizos(64).Target = 3
    Hechizos(64).Tipo = 1
    Hechizos(64).WAV = 108
    Hechizos(65).Nombre = "Petrificar"
    Hechizos(65).Desc = "Paraliza por un momento a la victima"
    Hechizos(65).PalabrasMagicas = "HOAX ROC"
    Hechizos(65).HechizeroMsg = "Has petrificado a"
    Hechizos(65).PropioMsg = "Te has petrificado."
    Hechizos(65).TargetMsg = "te ha inmovilizado."
    Hechizos(65).FXgrh = 108
    Hechizos(65).Loops = 1
    Hechizos(65).ManaRequerido = 450
    Hechizos(65).MinSkill = 60
    Hechizos(65).Paraliza = 1
    Hechizos(65).Target = 3
    Hechizos(65).Tipo = 2
    Hechizos(65).WAV = 16
    Hechizos(66).Nombre = "Inmovilizar "
    Hechizos(66).Desc = "Paraliza por un momento a la victima."
    Hechizos(66).PalabrasMagicas = "HOAX CEP'X"
    Hechizos(66).HechizeroMsg = "Has inmovilizado a"
    Hechizos(66).PropioMsg = "Te has inmovilizado."
    Hechizos(66).TargetMsg = "te ha inmovilizado."
    Hechizos(66).FXgrh = 104
    Hechizos(66).Loops = 3
    Hechizos(66).ManaRequerido = 450
    Hechizos(66).MinSkill = 60
    Hechizos(66).Paraliza = 1
    Hechizos(66).Target = 3
    Hechizos(66).Tipo = 2
    Hechizos(66).WAV = 26
    Hechizos(67).Nombre = "Circulo de Protección"
    Hechizos(67).Desc = "Barrera Mágica que protege de golpes."
    Hechizos(67).PalabrasMagicas = "RÎDO PROT MEX"
    Hechizos(67).HechizeroMsg = "Has protegido a"
    Hechizos(67).PropioMsg = "Te has protegido."
    Hechizos(67).TargetMsg = "te ha protegido."
    Hechizos(67).FXgrh = 102
    Hechizos(67).Loops = 3
    Hechizos(67).ManaRequerido = 800
    Hechizos(67).MinSkill = 100
    Hechizos(67).Protec = 10
    Hechizos(67).Target = 1
    Hechizos(67).Tipo = 2
    Hechizos(67).WAV = 16
    Hechizos(68).Nombre = "Aliento de Dragón"
    Hechizos(68).Desc = "Causa 125 a 140 puntos de daño a la victima."
    Hechizos(68).PalabrasMagicas = "ITÔ U DRAK"
    Hechizos(68).HechizeroMsg = "Has lanzado Aliento sobre"
    Hechizos(68).PropioMsg = ""
    Hechizos(68).TargetMsg = "lanzo Aliento de Dragón sobre tí."
    Hechizos(68).FXgrh = 101
    Hechizos(68).Loops = 1
    Hechizos(68).ManaRequerido = 1200
    Hechizos(68).MaxHP = 140
    Hechizos(68).MinHP = 125
    Hechizos(68).MinSkill = 150
    Hechizos(68).MinNivel = 40
    Hechizos(68).Resis = 1
    Hechizos(68).SubeHP = 2
    Hechizos(68).Target = 3
    Hechizos(68).Tipo = 1
    Hechizos(68).WAV = 16
    Hechizos(69).Nombre = "Hechizo Mortal"
    Hechizos(69).Desc = "Causa 3500 a 5000 puntos de daño a la victima."
    Hechizos(69).PalabrasMagicas = "Mor't DraG"
    Hechizos(69).HechizeroMsg = "Has lanzado Hechizo Mortal sobre"
    Hechizos(69).PropioMsg = "Has lanzado Hechizo Mortal sobre tí."
    Hechizos(69).TargetMsg = "lanzo Hechizo Mortal sobre tí."
    Hechizos(69).FXgrh = 33
    Hechizos(69).Loops = 1
    Hechizos(69).ManaRequerido = 2000
    Hechizos(69).MaxHP = 5000
    Hechizos(69).MinHP = 3500
    Hechizos(69).MinSkill = 200
    Hechizos(69).MinNivel = 70
    Hechizos(69).Resis = 1
    Hechizos(69).SubeHP = 2
    Hechizos(69).Target = 3
    Hechizos(69).Tipo = 1
    Hechizos(69).WAV = 27
    Hechizos(70).Nombre = "Disparo de Salva"
    Hechizos(70).Desc = "Causa 90 a 98 puntos de daño a la victima."
    Hechizos(70).PalabrasMagicas = ""
    Hechizos(70).HechizeroMsg = "Has lanzado Disparo de Salva sobre"
    Hechizos(70).PropioMsg = "Has Disparo de Salva sobre tí."
    Hechizos(70).TargetMsg = "lanzo Disparo de Salva sobre tí."
    Hechizos(70).FXgrh = 14
    Hechizos(70).Loops = 1
    Hechizos(70).ManaRequerido = 75
    Hechizos(70).MaxHP = 98
    Hechizos(70).MinHP = 90
    Hechizos(70).MinSkill = 0
    Hechizos(70).MinNivel = 20
    Hechizos(70).Resis = 1
    Hechizos(70).SubeHP = 2
    Hechizos(70).Target = 2
    Hechizos(70).Tipo = 1
    Hechizos(70).WAV = 27
    Hechizos(71).Nombre = "Disparo de Conmoción"
    Hechizos(71).Desc = "Paraliza por un momento a la víctima."
    Hechizos(71).PalabrasMagicas = "HOAX VORP"
    Hechizos(71).HechizeroMsg = "Has Conmocionado a"
    Hechizos(71).PropioMsg = "Te has Conmocionado."
    Hechizos(71).TargetMsg = "te ha Conmocionado."
    Hechizos(71).FXgrh = 76
    Hechizos(71).Loops = 1
    Hechizos(71).ManaRequerido = 350
    Hechizos(71).MinSkill = 0
    Hechizos(71).Paraliza = 1
    Hechizos(71).Target = 3
    Hechizos(71).Tipo = 2
    Hechizos(71).WAV = 16
    Hechizos(72).Nombre = "Disparo Certero"
    Hechizos(72).Desc = "Causa 105 a 115 puntos de daño a la victima."
    Hechizos(72).PalabrasMagicas = ""
    Hechizos(72).HechizeroMsg = "Has lanzado Disparo Certero sobre"
    Hechizos(72).PropioMsg = "Has lanzado Disparo Certero sobre tí."
    Hechizos(72).TargetMsg = "lanzo Disparo Certero tí."
    Hechizos(72).FXgrh = 105
    Hechizos(72).Loops = 1
    Hechizos(72).ManaRequerido = 680
    Hechizos(72).MaxHP = 115
    Hechizos(72).MinHP = 105
    Hechizos(72).MinSkill = 0
    Hechizos(72).MinNivel = 35
    Hechizos(72).Resis = 1
    Hechizos(72).SubeHP = 2
    Hechizos(72).Target = 3
    Hechizos(72).Tipo = 1
    Hechizos(72).WAV = 27
    Hechizos(73).Nombre = "Destello infernal"
    Hechizos(73).Desc = "Causa 75 a 80 puntos de daño a la victima."
    Hechizos(73).PalabrasMagicas = "Oleek U'ber"
    Hechizos(73).HechizeroMsg = "Has lanzado Destello infernal sobre"
    Hechizos(73).PropioMsg = "Has lanzado Destello infernal sobre tí."
    Hechizos(73).TargetMsg = "lanzo Destello infernal tí."
    Hechizos(73).FXgrh = 128
    Hechizos(73).Loops = 1
    Hechizos(73).ManaRequerido = 640
    Hechizos(73).MaxHP = 85
    Hechizos(73).MinHP = 80
    Hechizos(73).MinSkill = 110
    Hechizos(73).Resis = 1
    Hechizos(73).SubeHP = 2
    Hechizos(73).Target = 3
    Hechizos(73).Tipo = 1
    Hechizos(73).WAV = 27
    Hechizos(74).Nombre = "Instinto Animal"
    Hechizos(74).PalabrasMagicas = "Ar A'Kazar"
    Hechizos(74).HechizeroMsg = "Has lanzado Instinto Animal."
    Hechizos(74).TargetMsg = "ha lanzado Instinto Animal sobre tí."
    Hechizos(74).PropioMsg = "Has lanzado Instinto Animal sobre tí."
    Hechizos(74).Tipo = 1
    Hechizos(74).WAV = 17
    Hechizos(74).FXgrh = 83
    Hechizos(74).Loops = 3
    Hechizos(74).SubeFuerza = 1
    Hechizos(74).MinFuerza = 10
    Hechizos(74).MaxFuerza = 15
    Hechizos(74).SubeAgilidad = 1
    Hechizos(40).MaxAgilidad = 15
    Hechizos(40).MinAgilidad = 10
    Hechizos(74).MinSkill = 0
    Hechizos(74).ManaRequerido = 0
    Hechizos(74).Target = 1
    Hechizos(74).Noesquivar = 1
    Hechizos(75).Nombre = "Purificar"
    Hechizos(75).Desc = "Causa 85 a 95 puntos de daño a la victima y devuelve la mitad de daño inflijido a ti."
    Hechizos(75).PalabrasMagicas = "TIV FO PUR'G"
    Hechizos(75).HechizeroMsg = "Has lanzado Purificar sobre"
    Hechizos(75).TargetMsg = "lanzo Purificar sobre tí."
    Hechizos(75).PropioMsg = "Has lanzado Purificar sobre tí."
    Hechizos(75).Tipo = 1
    Hechizos(75).WAV = 27
    Hechizos(75).FXgrh = 90
    Hechizos(75).Loops = 1
    Hechizos(75).Resis = 1
    Hechizos(75).SubeHP = 2
    Hechizos(75).MinHP = 85
    Hechizos(75).MaxHP = 100
    Hechizos(75).MinSkill = 150
    Hechizos(75).ManaRequerido = 1500
    Hechizos(75).MinNivel = 30
    Hechizos(75).Target = 3

    Exit Sub
Errorfeo:
    MsgBox ("error en cargarhechizos")

End Sub

Sub CargamosObjetos()

    Dim Leer As clsIniManager

    Set Leer = New clsIniManager

    '*****************************************************************
    'Carga la lista de objetos
    '*****************************************************************
    Dim Object As Long, NumObjDatas As Long
    Leer.Initialize DirInit & "Obj.dat"

    'obtiene el numero de obj
    NumObjDatas = Val(Leer.GetValue("INIT", "NumObjs"))

    ReDim ObjData(1 To NumObjDatas) As ObjData

    'Llena la lista
    For Object = 1 To NumObjDatas

        With ObjData(Object)
        
            .Name = Leer.GetValue("OBJ" & Object, "Name")
            .Magia = Val(Leer.GetValue("OBJ" & Object, "Magia"))
            .Vendible = Val(Leer.GetValue("OBJ" & Object, "Vendible"))
            .GrhIndex = Val(Leer.GetValue("OBJ" & Object, "GrhIndex"))
            .ObjType = Val(Leer.GetValue("OBJ" & Object, "ObjType"))
            .SubTipo = Val(Leer.GetValue("OBJ" & Object, "Subtipo"))
            .ArmaNpc = Val(Leer.GetValue("OBJ" & Object, "ArmaNpc"))
            .Newbie = Val(Leer.GetValue("OBJ" & Object, "Newbie"))
            .peso = 0    ' val(Leer.GetValue("OBJ" & Object, "Peso"))

            Select Case .SubTipo
            
                Case eObjType.otESCUDO
                    .ShieldAnim = Val(Leer.GetValue("OBJ" & Object, "Anim"))
                    .LingH = Val(Leer.GetValue("OBJ" & Object, "LingH"))
                    .LingP = Val(Leer.GetValue("OBJ" & Object, "LingP"))
                    .LingO = Val(Leer.GetValue("OBJ" & Object, "LingO"))
                    .SkHerreria = Val(Leer.GetValue("OBJ" & Object, "SkHerreria"))
                    .Gemas = Val(Leer.GetValue("OBJ" & Object, "Gemas"))
                    .Diamantes = Val(Leer.GetValue("OBJ" & Object, "Diamantes"))
        
                Case eObjType.otCASCO
                    .CascoAnim = Val(Leer.GetValue("OBJ" & Object, "Anim"))
                    .LingH = Val(Leer.GetValue("OBJ" & Object, "LingH"))
                    .LingP = Val(Leer.GetValue("OBJ" & Object, "LingP"))
                    .LingO = Val(Leer.GetValue("OBJ" & Object, "LingO"))
                    .Gemas = Val(Leer.GetValue("OBJ" & Object, "Gemas"))
                    .Diamantes = Val(Leer.GetValue("OBJ" & Object, "Diamantes"))
                    .SkHerreria = Val(Leer.GetValue("OBJ" & Object, "SkHerreria"))

                Case eObjType.otALAS
                    .AlasAnim = Val(Leer.GetValue("OBJ" & Object, "Anim"))
                    .LingH = Val(Leer.GetValue("OBJ" & Object, "LingH"))
                    .LingP = Val(Leer.GetValue("OBJ" & Object, "LingP"))
                    .LingO = Val(Leer.GetValue("OBJ" & Object, "LingO"))
                    .Gemas = Val(Leer.GetValue("OBJ" & Object, "Gemas"))
                    .Diamantes = Val(Leer.GetValue("OBJ" & Object, "Diamantes"))
                    .SkHerreria = Val(Leer.GetValue("OBJ" & Object, "SkHerreria"))

                Case eObjType.otBOTA
                    .Botas = Val(Leer.GetValue("OBJ" & Object, "Anim"))
                    .LingH = Val(Leer.GetValue("OBJ" & Object, "LingH"))
                    .LingP = Val(Leer.GetValue("OBJ" & Object, "LingP"))
                    .LingO = Val(Leer.GetValue("OBJ" & Object, "LingO"))
                    .SkHerreria = Val(Leer.GetValue("OBJ" & Object, "SkHerreria"))

            End Select

            '[GAU]
            .Ropaje = Val(Leer.GetValue("OBJ" & Object, "NumRopaje"))
            .HechizoIndex = Val(Leer.GetValue("OBJ" & Object, "HechizoIndex"))

            'pluto:6.2----------
            Select Case .ObjType
            
                Case eObjType.otAnillo
                    .LingH = Val(Leer.GetValue("OBJ" & Object, "LingH"))
                    .LingP = Val(Leer.GetValue("OBJ" & Object, "LingP"))
                    .LingO = Val(Leer.GetValue("OBJ" & Object, "LingO"))
                    .SkHerreria = Val(Leer.GetValue("OBJ" & Object, "SkHerreria"))
                    .Gemas = Val(Leer.GetValue("OBJ" & Object, "Gemas"))
                    .Diamantes = Val(Leer.GetValue("OBJ" & Object, "Diamantes"))

                Case eObjType.otWEAPON
                    .WeaponAnim = Val(Leer.GetValue("OBJ" & Object, "Anim"))
                    .Apuñala = Val(Leer.GetValue("OBJ" & Object, "Apuñala"))
                    .Envenena = Val(Leer.GetValue("OBJ" & Object, "Envenena"))
                    .MaxHit = Val(Leer.GetValue("OBJ" & Object, "MaxHIT"))
                    .MinHit = Val(Leer.GetValue("OBJ" & Object, "MinHIT"))
                    .LingH = Val(Leer.GetValue("OBJ" & Object, "LingH"))
                    .LingP = Val(Leer.GetValue("OBJ" & Object, "LingP"))
                    .LingO = Val(Leer.GetValue("OBJ" & Object, "LingO"))
                    .SkHerreria = Val(Leer.GetValue("OBJ" & Object, "SkHerreria"))
                    .Real = Val(Leer.GetValue("OBJ" & Object, "Real"))
                    .Caos = Val(Leer.GetValue("OBJ" & Object, "Caos"))
                    .proyectil = Val(Leer.GetValue("OBJ" & Object, "Proyectil"))
                    .Municion = Val(Leer.GetValue("OBJ" & Object, "Municiones"))
                    .Gemas = Val(Leer.GetValue("OBJ" & Object, "Gemas"))
                    .Diamantes = Val(Leer.GetValue("OBJ" & Object, "Diamantes"))
                    .SkArma = Val(Leer.GetValue("OBJ" & Object, "SKARMA"))
                    .SkArco = Val(Leer.GetValue("OBJ" & Object, "SKARCO"))

                Case eObjType.otARMOUR
                    .LingH = Val(Leer.GetValue("OBJ" & Object, "LingH"))
                    .LingP = Val(Leer.GetValue("OBJ" & Object, "LingP"))
                    .LingO = Val(Leer.GetValue("OBJ" & Object, "LingO"))
                    .SkHerreria = Val(Leer.GetValue("OBJ" & Object, "SkHerreria"))
                    .Real = Val(Leer.GetValue("OBJ" & Object, "Real"))
                    .Caos = Val(Leer.GetValue("OBJ" & Object, "Caos"))
                    .Gemas = Val(Leer.GetValue("OBJ" & Object, "Gemas"))
                    .Diamantes = Val(Leer.GetValue("OBJ" & Object, "Diamantes"))
                    .ObjetoClan = Leer.GetValue("OBJ" & Object, "ObjetoClan")

                Case eObjType.otHERRAMIENTAS
                    .LingH = Val(Leer.GetValue("OBJ" & Object, "LingH"))
                    .LingP = Val(Leer.GetValue("OBJ" & Object, "LingP"))
                    .LingO = Val(Leer.GetValue("OBJ" & Object, "LingO"))
                    .SkHerreria = Val(Leer.GetValue("OBJ" & Object, "SkHerreria"))
                    .Gemas = Val(Leer.GetValue("OBJ" & Object, "Gemas"))
                    .Diamantes = Val(Leer.GetValue("OBJ" & Object, "Diamantes"))

                Case eObjType.otINSTRUMENTOS
                    .Snd1 = Val(Leer.GetValue("OBJ" & Object, "SND1"))
                    .Snd2 = Val(Leer.GetValue("OBJ" & Object, "SND2"))
                    .Snd3 = Val(Leer.GetValue("OBJ" & Object, "SND3"))
                    .MinInt = Val(Leer.GetValue("OBJ" & Object, "MinInt"))
          
                Case eObjType.otMINERALES, eObjType.otBARCOS
      
                    .MinSkill = Val(Leer.GetValue("OBJ" & Object, "MinSkill"))
        
                Case eObjType.otPUERTAS, eObjType.otBOTELLAVACIA, eObjType.otBOTELLALLENA
                    .IndexAbierta = Val(Leer.GetValue("OBJ" & Object, "IndexAbierta"))
                    .IndexCerrada = Val(Leer.GetValue("OBJ" & Object, "IndexCerrada"))
                    .IndexCerradaLlave = Val(Leer.GetValue("OBJ" & Object, "IndexCerradaLlave"))
                  
                Case eObjType.otPOCIONES
                    .TipoPocion = Val(Leer.GetValue("OBJ" & Object, "TipoPocion"))
                    .MaxModificador = Val(Leer.GetValue("OBJ" & Object, "MaxModificador"))
                    .MinModificador = Val(Leer.GetValue("OBJ" & Object, "MinModificador"))
                    .DuracionEfecto = Val(Leer.GetValue("OBJ" & Object, "DuracionEfecto"))
            
                Case eObjType.otBARCOS
                    .MaxHit = Val(Leer.GetValue("OBJ" & Object, "MaxHIT"))
                    .MinHit = Val(Leer.GetValue("OBJ" & Object, "MinHIT"))

                Case eObjType.otFLECHAS
                    .MaxHit = Val(Leer.GetValue("OBJ" & Object, "MaxHIT"))
                    .MinHit = Val(Leer.GetValue("OBJ" & Object, "MinHIT"))
            
                Case eObjType.otARBOLES

                    If Not IsGrhTree(.GrhIndex) Then
                        NumArboles = NumArboles + 1
                        ReDim Preserve ListArboles(1 To NumArboles) As Long
                        ListArboles(NumArboles) = .GrhIndex

                    End If

            End Select
            
            .LingoteIndex = Val(Leer.GetValue("OBJ" & Object, "LingoteIndex"))
            .MineralIndex = Val(Leer.GetValue("OBJ" & Object, "MineralIndex"))

            .MaxHP = Val(Leer.GetValue("OBJ" & Object, "MaxHP"))
            .MinHP = Val(Leer.GetValue("OBJ" & Object, "MinHP"))

            .Mujer = Val(Leer.GetValue("OBJ" & Object, "Mujer"))
            .Hombre = Val(Leer.GetValue("OBJ" & Object, "Hombre"))

            .MinHam = Val(Leer.GetValue("OBJ" & Object, "MinHam"))
            .MinSed = Val(Leer.GetValue("OBJ" & Object, "MinAgu"))
    
            .MinDef = Val(Leer.GetValue("OBJ" & Object, "MINDEF"))
            .MaxDef = Val(Leer.GetValue("OBJ" & Object, "MAXDEF"))
            
            .Defmagica = Val(Leer.GetValue("OBJ" & Object, "DEFMAGICA"))
            .Defcuerpo = Val(Leer.GetValue("OBJ" & Object, "DEFCUERPO"))
            
            .Drop = Val(Leer.GetValue("OBJ" & Object, "DROP"))
            .Respawn = Val(Leer.GetValue("OBJ" & Object, "ReSpawn"))

            .RazaEnana = Val(Leer.GetValue("OBJ" & Object, "RazaEnana"))
            .razaelfa = Val(Leer.GetValue("OBJ" & Object, "RazaElfa"))
            .razavampiro = Val(Leer.GetValue("OBJ" & Object, "Razavampiro"))
            .razaorca = Val(Leer.GetValue("OBJ" & Object, "Razaorca"))
            .razahumana = Val(Leer.GetValue("OBJ" & Object, "Razahumana"))

            .Valor = Val(Leer.GetValue("OBJ" & Object, "Valor"))
            .nocaer = Val(Leer.GetValue("OBJ" & Object, "nocaer"))
            .objetoespecial = Val(Leer.GetValue("OBJ" & Object, "objetoespecial"))

            .Crucial = Val(Leer.GetValue("OBJ" & Object, "Crucial"))
            .Cerrada = Val(Leer.GetValue("OBJ" & Object, "abierta"))

            If .Cerrada = 1 Then
                .Llave = Val(Leer.GetValue("OBJ" & Object, "Llave"))
                .Clave = Val(Leer.GetValue("OBJ" & Object, "Clave"))

            End If

            'Puertas y llaves
            .Clave = Val(Leer.GetValue("OBJ" & Object, "Clave"))

            .texto = Leer.GetValue("OBJ" & Object, "Texto")
            .GrhSecundario = Val(Leer.GetValue("OBJ" & Object, "VGrande"))

            .Agarrable = Val(Leer.GetValue("OBJ" & Object, "Agarrable"))
            .ForoID = Leer.GetValue("OBJ" & Object, "ID")

            Dim i As Long, tStr As String

            For i = 1 To NUMCLASES

                tStr = Leer.GetValue("OBJ" & Object, "CP" & i)

                If LenB(tStr) <> 0 Then
                    tStr = mid$(tStr, 1, Len(tStr) - 1)
                    tStr = Right$(tStr, Len(tStr) - 1)

                End If

                .ClaseProhibida(i) = tStr
            Next

            .Resistencia = Val(Leer.GetValue("OBJ" & Object, "Resistencia"))
            .SkCarpinteria = Val(Leer.GetValue("OBJ" & Object, "SkCarpinteria"))

            If .SkCarpinteria > 0 Then .Madera = Val(Leer.GetValue("OBJ" & Object, "Madera"))
            
            'Bebidas
            .MinSta = Val(Leer.GetValue("OBJ" & Object, "MinST"))
            .razavampiro = Val(Leer.GetValue("OBJ" & Object, "razavampiro"))
            .Cregalos = Val(Leer.GetValue("OBJ" & Object, "Cregalos"))
            .Pregalo = Val(Leer.GetValue("OBJ" & Object, "Pregalo"))

            If .LingH > 0 Or .LingP > 0 Or .LingO > 0 Or .Madera > 0 Or .Gemas > 0 Or .Diamantes > 0 Then
            
                NumTrabajo = NumTrabajo + 1
                ReDim Preserve DataTrabajo(1 To NumTrabajo) As Integer
                DataTrabajo(NumTrabajo) = Object

            End If
            
        End With

    Next Object

    Call FixListTree
    
    Set Leer = Nothing
        
End Sub

Public Sub FixListTree()

    NumArboles = NumArboles + 4
    ReDim Preserve ListArboles(1 To NumArboles) As Long
    
    ListArboles(NumArboles) = 31267
    ListArboles(NumArboles - 1) = 31271
    ListArboles(NumArboles - 2) = 31278
    ListArboles(NumArboles - 3) = 31264
   
End Sub
