Attribute VB_Name = "Mod_WGLEngine"
Option Explicit

Public TimerElapsedTime   As Single
Public TimerTicksPerFrame As Single
Public timerEngine        As Currency

Public InvBackGround      As Long

Private Material()        As Integer     ' Texturas
Private Font()            As Integer     ' Fonts

Private Type Uniform
    Effect  As wGL_Uniform
End Type

Public Enum QuadTree

    LAYER_2 = 1
    LAYER_3 = 2
    LAYER_4 = 3
    LAYER_OBJ = 4
    LAYER_CHAR = 5

End Enum

Private g_Technique      As Integer     ' Tecnica 1 ( !Alpha )
Private g_TechniqueAlpha As Integer     ' Tecnica 2 ( Alpha )
Public g_Mode            As wGL_Graphic_Mode
Public g_Swarm           As wGL_Temp_Swarm
Public g_Uniform         As Uniform
Public g_Rain_Material   As Integer
Public g_Last_OffsetX    As Single
Public g_Last_OffsetY    As Single

Public Enum COLORS

    AliceBlue = &HFFF0F8FF
    AntiqueWhite = &HFFFAEBD7
    Aqua = &HFF00FFFF
    Aquamarine = &HFF7FFFD4
    Azure = &HFFF0FFFF
    Beige = &HFFF5F5DC
    Bisque = &HFFFFE4C4
    Black = &HFF000000
    BlanchedAlmond = &HFFFFEBCD
    Blue = &HFF0000FF
    BlueViolet = &HFF8A2BE2
    Brown = &HFFA52A2A
    BurlyWood = &HFFDEB887
    CadetBlue = &HFF5F9EA0
    Chartreuse = &HFF7FFF00
    Chocolate = &HFFD2691E
    Coral = &HFFFF7F50
    CornflowerBlue = &HFF6495ED
    Cornsilk = &HFFFFF8DC
    Crimson = &HFFDC143C
    Cyan = &HFF00FFFF
    DarkBlue = &HFF00008B
    DarkBrown = &HFF804040
    DarkCyan = &HFF008B8B
    DarkGoldenrod = &HFFB8860B
    DarkGray = &HFFA9A9A9
    DarkGreen = &HFF006400
    DarkKhaki = &HFFBDB76B
    DarkMagenta = &HFF8B008B
    DarkOliveGreen = &HFF556B2F
    DarkOrange = &HFFFF8C00
    DarkOrchid = &HFF9932CC
    DarkRed = &HFF8B0000
    DarkSalmon = &HFFE9967A
    DarkSeaGreen = &HFF8FBC8B
    DarkSlateBlue = &HFF483D8B
    DarkSlateGray = &HFF2F4F4F
    DarkTurquoise = &HFF00CED1
    DarkViolet = &HFF9400D3
    DeepPink = &HFFFF1493
    DeepSkyBlue = &HFF00BFFF
    DimGray = &HFF696969
    DodgerBlue = &HFF1E90FF
    Firebrick = &HFFB22222
    FloralWhite = &HFFFFFAF0
    ForestGreen = &HFF228B22
    Fuchsia = &HFFFF00FF
    Gainsboro = &HFFDCDCDC
    GhostWhite = &HFFF8F8FF
    Gold = &HFFFFD700
    Goldenrod = &HFFDAA520
    Gray = &HFF808080
    Green = &HFF008000
    GreenYellow = &HFFADFF2F
    Honeydew = &HFFF0FFF0
    HotPink = &HFFFF69B4
    IndianRed = &HFFCD5C5C
    Indigo = &HFF4B0082
    Ivory = &HFFFFFFF0
    Khaki = &HFFF0E68C
    Lavender = &HFFE6E6FA
    LavenderBlush = &HFFFFF0F5
    LawnGreen = &HFF7CFC00
    LemonChiffon = &HFFFFFACD
    LightBlue = &HFFADD8E6
    LightCoral = &HFFF08080
    LightCyan = &HFFE0FFFF
    LightGoldenrodYellow = &HFFFAFAD2
    LightGray = &HFFD3D3D3
    LightGreen = &HFF90EE90
    LightPink = &HFFFFB6C1
    LightSalmon = &HFFFFA07A
    LightSeaGreen = &HFF20B2AA
    LightSkyBlue = &HFF87CEFA
    LightSlateGray = &HFF778899
    LightSteelBlue = &HFFB0C4DE
    LightYellow = &HFFFFFFE0
    Lime = &HFF00FF00
    LimeGreen = &HFF32CD32
    Linen = &HFFFAF0E6
    Magenta = &HFFFF00FF
    Maroon = &HFF800000
    MediumAquamarine = &HFF66CDAA
    MediumBlue = &HFF0000CD
    MediumOrchid = &HFFBA55D3
    MediumPurple = &HFF9370DB
    MediumSeaGreen = &HFF3CB371
    MediumSlateBlue = &HFF7B68EE
    MediumSpringGreen = &HFF00FA9A
    MediumTurquoise = &HFF48D1CC
    MediumVioletRed = &HFFC71585
    MidnightBlue = &HFF191970
    MintCream = &HFFF5FFFA
    MistyRose = &HFFFFE4E1
    Moccasin = &HFFFFE4B5
    NavajoWhite = &HFFFFDEAD
    Navy = &HFF000080
    OldLace = &HFFFDF5E6
    Olive = &HFF808000
    OliveDrab = &HFF6B8E23
    Orange = &HFFFFA500
    OrangeRed = &HFFFF4500
    Orchid = &HFFDA70D6
    PaleGoldenrod = &HFFEEE8AA
    PaleGreen = &HFF98FB98
    PaleTurquoise = &HFFAFEEEE
    PaleVioletRed = &HFFDB7093
    PapayaWhip = &HFFFFEFD5
    PeachPuff = &HFFFFDAB9
    Peru = &HFFCD853F
    Pink = &HFFFFC0CB
    Plum = &HFFDDA0DD
    PowderBlue = &HFFB0E0E6
    Purple = &HFF800080
    Red = &HFFFF0000
    RosyBrown = &HFFBC8F8F
    RoyalBlue = &HFF4169E1
    SaddleBrown = &HFF8B4513
    Salmon = &HFFFA8072
    SandyBrown = &HFFF4A460
    SeaGreen = &HFF2E8B57
    SeaShell = &HFFFFF5EE
    Sienna = &HFFA0522D
    Silver = &HFFC0C0C0
    SkyBlue = &HFF87CEEB
    SlateBlue = &HFF6A5ACD
    SlateGray = &HFF708090
    Snow = &HFFFFFAFA
    SpringGreen = &HFF00FF7F
    SteelBlue = &HFF4682B4
    Tan = &HFFD2B48C
    Teal = &HFF008080
    Thistle = &HFFD8BFD8
    Tomato = &HFFFF6347
    Transparent = &HFFFFFF
    Turquoise = &HFF40E0D0
    Violet = &HFFEE82EE
    Wheat = &HFFF5DEB3
    White = &HFFFFFFFF
    WhiteSmoke = &HFFF5F5F5
    XPBlue = &HFF003CC7
    XPGradient = &HFFC6C5D7
    XPGoldDark = &HFFB08218
    XPGoldLight = &HFFFCF9C3
    Yellow = &HFFFFFF00
    YellowGreen = &HFF9ACD32

End Enum

Private Sub DrawExampleCreateChar()
    
    Static Count   As Long
    Static Heading As Long
    Count = Count + 1
    
    If Heading = 0 Then Heading = 3
    
    If Count >= 5000 Then
        Heading = Heading + 1

        If Heading > 4 Then Heading = 3
        Count = 0

    End If
   
    Call wGL_Graphic.Use_Device(CreateCharDevice)
    Call wGL_Graphic.Clear(CLEAR_STENCIL Or CLEAR_COLOR Or CLEAR_DEPTH, &H0, 1#, 0)    ' AARRGGBB
    Call wGL_Graphic_Renderer.Update_Projection(0, CreateCharDimension.Width, CreateCharDimension.Height)
    Call SetEffect(False)
    
    With CreateCharExample

        If .Head.GrhIndex > 0 And UserHead > 0 Then
            .Head = HeadData(UserHead).Head(Heading)
            Call DrawGrhtoSurface(.Head, 15 + BodyData(UserBody).HeadOffSet.x, 40 + BodyData(UserBody).HeadOffSet.y, 0#, 1, 0, White)

        End If

        If .Body.GrhIndex > 0 And UserBody > 0 Then
            .Body = BodyData(UserBody).Walk(Heading)
            Call DrawGrhtoSurface(.Body, 15, 40, wGl_Depth(1, 60, 100, 5), 1, 1, White)

        End If
        
    End With
    
    Call wGL_Graphic_Renderer.Flush

End Sub

Private Sub DrawExampleCreateCharPJ()
    
    Static Count   As Long
    Static Heading As Long
    Count = Count + 1
    
    If Heading = 0 Then Heading = 3
    
    If Count >= 5000 Then
        Heading = Heading + 1

        If Heading > 4 Then Heading = 3
        Count = 0

    End If
   
    Call wGL_Graphic.Use_Device(StatsDevice)
    Call wGL_Graphic.Clear(CLEAR_STENCIL Or CLEAR_COLOR Or CLEAR_DEPTH, &H0, 1#, 0)    ' AARRGGBB
    Call wGL_Graphic_Renderer.Update_Projection(0, StatsDimension.Width, StatsDimension.Height)
    Call SetEffect(False)
    
    With StatsExample

        If .Head.GrhIndex > 0 And cabezaPJ > 0 Then
            .Head = HeadData(cabezaPJ).Head(Heading)
            Call DrawGrhtoSurface(.Head, 15 + BodyData(bodyPJ).HeadOffSet.x, 40 + BodyData(bodyPJ).HeadOffSet.y, wGl_Depth(1, 60, 100, 6), 1, 0, White)

        End If

        If .Body.GrhIndex > 0 And UserBody > 0 Then
            .Body = BodyData(bodyPJ).Walk(Heading)
            Call DrawGrhtoSurface(.Body, 15, 40, wGl_Depth(1, 60, 100, 5), 1, 1, White)

        End If

        If .HelmetPJ.GrhIndex > 0 And cascoPJ > 0 Then
            .HelmetPJ = CascoAnimData(cascoPJ).Head(Heading)
            Call DrawGrhtoSurface(.HelmetPJ, 15 + BodyData(bodyPJ).HeadOffSet.x, 6 + BodyData(bodyPJ).HeadOffSet.y, 0#, 1, 0, White)

        End If

        If .Weapon.GrhIndex > 0 And armaPJ > 0 Then
            '.Arma = WeaponAnimData(TempInt)
            .Weapon = WeaponAnimData(armaPJ).WeaponWalk(Heading)
            Call DrawGrhtoSurface(.Weapon, 15 + BodyData(bodyPJ).HeadOffSet.x, 43 + BodyData(bodyPJ).HeadOffSet.y, 0#, 1, 0, White)
            'Call DrawGrhtoSurface(.Arma.WeaponWalk(.Heading), PixelOffsetX + ZZ, PixelOffsetY - xx, wGl_Depth(3, x, y, 5), 1, 1, Color, 0, , True)

        End If
        '
        If .Shield.GrhIndex > 0 And escudoPJ > 0 Then
            .Shield = ShieldAnimData(escudoPJ).ShieldWalk(Heading)
            Call DrawGrhtoSurface(.Shield, 15 + BodyData(bodyPJ).HeadOffSet.x, 41 + BodyData(bodyPJ).HeadOffSet.y, 0#, 1, 0, White)

        End If
        
    End With
    
    Call wGL_Graphic_Renderer.Flush

End Sub

Public Sub SetBodyExample()
    
    'BodyExample = BodyData(UserBody).Walk(3)
    'BodyExample.Started = 1
    'BodyExample.Loops = INFINITE_LOOPS
    Call InitGrh(CreateCharExample.Body, BodyData(UserBody).Walk(3).GrhIndex, 1)
    
    'HeadExample = HeadData(UserHead).Head(3)
    'HeadExample.Started = 1
    'HeadExample.Loops = INFINITE_LOOPS
    Call InitGrh(CreateCharExample.Head, HeadData(UserHead).Head(3).GrhIndex, 1)

End Sub

Public Sub SetBodyExamplePJ()

    If escudoPJ > 0 Then
    Call InitGrh(StatsExample.Shield, ShieldAnimData(escudoPJ).ShieldWalk(3).GrhIndex, 1)
    End If
    
    If armaPJ > 0 Then
    Call InitGrh(StatsExample.Weapon, WeaponAnimData(armaPJ).WeaponWalk(3).GrhIndex, 1)
    End If
    'BodyExample = BodyData(UserBody).Walk(3)
    'BodyExample.Started = 1
    'BodyExample.Loops = INFINITE_LOOPS
    If bodyPJ > 0 Then
    Call InitGrh(StatsExample.Body, BodyData(bodyPJ).Walk(3).GrhIndex, 1)
    End If
    
    If cabezaPJ > 0 Then
    Call InitGrh(StatsExample.Head, HeadData(cabezaPJ).Head(3).GrhIndex, 1)
    End If
    
    If cascoPJ > 0 Then
    Call InitGrh(StatsExample.HelmetPJ, CascoAnimData(cascoPJ).Head(3).GrhIndex, 1)
    End If
    
    'HeadExample = HeadData(UserHead).Head(3)
    'HeadExample.Started = 1
    'HeadExample.Loops = INFINITE_LOOPS

End Sub

Public Function LoadBytes(ByVal FileName As String) As Byte()

    Dim handle As Integer
    handle = FreeFile
    
    Open FileName For Binary Access Read Lock Read As handle

    ReDim LoadBytes(LOF(handle) - 1)
    Get handle, , LoadBytes

    Close handle
    
End Function

Public Sub DrawRain()

    Dim Animation As Single
    Animation = timerEngine / 1000#
    
    ' Temporally like everything else :P
    Dim destination As wGL_Rectangle, source As wGL_Rectangle
    destination.X1 = 0
    destination.Y1 = 0
    destination.X2 = frmMain.MainViewPic.ScaleWidth
    destination.Y2 = frmMain.MainViewPic.ScaleHeight
    
    source.X1 = 0#
    source.Y1 = 1 + Animation
    source.X2 = 1#
    source.Y2 = Animation

    Call wGL_Graphic_Renderer.Draw(destination, source, 0#, 0#, -1, g_Rain_Material, g_TechniqueAlpha)
    
End Sub

Public Function wGl_Init(ByRef hWnd As Long, ByVal Width As Integer, ByVal Height As Integer) As Boolean

    wGl_Init = False

    g_Mode = 0

    If MsgBox("¿Deseas iniciar la sincronizacion vertical?", vbYesNo) = vbYes Then g_Mode = MODE_SYNCHRONISED
    
    If wGL_Graphic.Create_Driver(DRIVER_DIRECT3D9, g_Mode, hWnd, Width, Height) Then
    
        Set g_Swarm = New wGL_Temp_Swarm
    
        ReDim Font(0 To 1) As Integer
        ReDim Material(0 To GrhCount + 1) As Integer
        
        ' Create Font
        Font(0) = wGL_Graphic_Renderer.Create_Font(LoadBytes(DirFonts & FontPrimary))
        Font(1) = wGL_Graphic_Renderer.Create_Font(LoadBytes(DirFonts & FontSecondary))
        
        Call wGL_Graphic_Renderer.Update_Font_Fallback(Font(0), Font(1))
            
        ' Create Technique
        g_Technique = wGL_Graphic_Renderer.Create_Technique
        Call wGL_Graphic_Renderer.Update_Technique_Program(g_Technique, wGL_Graphic.Create_Program(LoadBytes(DirShaders & "Basic.vs"), LoadBytes(DirShaders & "Basic-1.fs")))

        Dim Descriptor As wGL_Graphic_Descriptor
        Descriptor.Depth = COMPARISON_LESS_EQUAL
        Descriptor.Depth_Mask = True
        Descriptor.Mask_Red = True
        Descriptor.Mask_Green = True
        Descriptor.Mask_Blue = True
        Descriptor.Mask_Alpha = True
        Descriptor.Stencil_Mask = &HFF
    
        Call wGL_Graphic_Renderer.Update_Technique_Descriptor(g_Technique, Descriptor)
    
        Dim Sampler As wGL_Graphic_Sampler
        Sampler.Address_X = SAMPLER_ADDRESS_WRAP
        Sampler.Address_Y = SAMPLER_ADDRESS_WRAP
        Call wGL_Graphic_Renderer.Update_Technique_Sampler(g_Technique, 0, Sampler)
    
        g_TechniqueAlpha = wGL_Graphic_Renderer.Create_Technique
        Call wGL_Graphic_Renderer.Update_Technique_Program(g_TechniqueAlpha, wGL_Graphic.Create_Program(LoadBytes(DirShaders & "Basic.vs"), LoadBytes(DirShaders & "Basic-2.fs")))
        Call wGL_Graphic_Renderer.Update_Technique_Sampler(g_TechniqueAlpha, 0, Sampler)
    
        Descriptor.Blend_Color_Source = BLEND_FACTOR_SRC_ALPHA
        Descriptor.Blend_Color_Destination = BLEND_FACTOR_ONE_MINUS_SRC_ALPHA
        Descriptor.Depth_Mask = False
        Call wGL_Graphic_Renderer.Update_Technique_Descriptor(g_TechniqueAlpha, Descriptor)

        If Navida = 0 Then
            Bmplluvia = 5556
        Else
            Bmplluvia = 11000
        End If

        g_Rain_Material = wGL_Graphic_Renderer.Create_Material
        Call wGL_Graphic_Renderer.Update_Material_Texture(g_Rain_Material, 0, wGL_Graphic.Create_Texture_From_Image(LoadBytes(DirGraficos & "15168.PNG")))
                            
        InvBackGround = GrhCount + 1
        Material(InvBackGround) = wGL_Graphic_Renderer.Create_Material()
        Call wGL_Graphic_Renderer.Update_Material_Texture(Material(InvBackGround), &H0, wGL_Graphic.Create_Texture_From_Image(LoadBytes(DirInterfaces & "FondoInventario.png")))
                            
        wGl_Init = True
    Else
        MsgBox "No se pudo encontrar d3d9.dll. Esto puede deberse a que tu sistema operativo no es compatible, o que alguna de las librerías no está correctamente instalada o actualizada. " & "Contacta a Soporte para más información."
    End If
    
End Function

Public Sub wGl_CreateDeviceSecondary(ByVal Instance As Long)

    Select Case Instance

        Case 1

            With frmCrearPersonaje.RenderChar
                CreateCharDimension.Height = .ScaleHeight
                CreateCharDimension.Width = .ScaleWidth
                CreateCharDevice = wGL_Graphic.Create_Device_From_Display(.hWnd, CreateCharDimension.Width, CreateCharDimension.Height)
            End With
            
        Case 2

            With frmCuentas.RenderCharPJ
                StatsDimension.Height = .ScaleHeight
                StatsDimension.Width = .ScaleWidth
                StatsDevice = wGL_Graphic.Create_Device_From_Display(.hWnd, StatsDimension.Width, StatsDimension.Height)
            End With
    
    End Select
            
End Sub

Public Sub wGl_Draw_Text(ByVal FontType As Integer, _
                         ByVal Size As Integer, _
                         ByVal x As Integer, _
                         ByVal y As Integer, _
                         ByVal Color As Long, _
                         ByVal Alignment As wGL_Graphic_Font_Alignment, _
                         ByVal Text As String)

    If LenB(Text) = 0 Then Exit Sub
    Call wGL_Graphic_Renderer.Draw_Text(Font(FontType), Size, x, y, 0#, Color, Alignment, Text)
         
End Sub

Public Sub wGl_Draw_Text_Z(ByVal FontType As Integer, _
                           ByVal Size As Integer, _
                           ByVal x As Integer, _
                           ByVal y As Integer, _
                           ByVal Z As Single, _
                           ByVal Color As Long, _
                           ByVal Alignment As wGL_Graphic_Font_Alignment, _
                           ByVal Text As String)
    
    If LenB(Text) = 0 Then Exit Sub
    Call wGL_Graphic_Renderer.Draw_Text(Font(FontType), Size, x, y, Z, Color, Alignment, Text)

End Sub

Public Sub wGl_Renderer()

    If EngineRun Then
    
        Dim MainVisible As Boolean
        
        MainVisible = frmMain.WindowState <> 1 And frmMain.Visible
    
        If CharInCreation Then Call DrawExampleCreateChar
        If CuentaLoginPJ Then Call DrawExampleCreateCharPJ
    
        'Sólo dibujamos si la ventana no está minimizada
        If MainVisible Then
        
            If ShowNextFrame() Then
                FPS = FPS + 1
            End If
            
            Call RenderSounds
            Call CheckKeys
        Else
            Sleep 1
        End If
                
        Call wGL_Graphic.Commit

        'FPS Counter - mostramos las FPS
        If GetTickCount - lFrameTimer >= 1000 Then
            FramesPerSecCounter = FPS
            FpsLastCheck = GetTickCount
            FPS = 0
            
            If MainVisible Then
                frmMain.FPSVIEW.Caption = 400
                
            
                        
                'luz aviso dificultad mapa
                Dim laviso  As String
                Static cLuz As Byte
                cLuz = cLuz + 1
                If cLuz = 4 Then cLuz = 0
            
                Select Case Luzaviso2

                    Case 1
                        laviso = "verde-" & cLuz & ".jpg"

                    Case 2
                        laviso = "amarillo-" & cLuz & ".jpg"

                    Case 3
                        laviso = "rojo-" & cLuz & ".jpg"
                End Select

                frmMain.luzaviso.Picture = cLoadPicture(DirInterfaces & laviso)

            End If
        End If

    End If
  
End Sub

Public Sub wGl_Render_Texture(ByVal FileNum As Long, _
                              ByVal x As Single, _
                              ByVal y As Single, _
                              ByVal Z As Single, _
                              ByVal pixelWidth As Single, _
                              ByVal pixelHeight As Single, _
                              ByRef Src As wGL_Rectangle, _
                              ByVal Color As Long, _
                              ByVal Angle As Single, _
                              ByVal Alpha As Boolean)
                              
    ' Create Material
    If Material(FileNum) <= 0 Then
        Material(FileNum) = wGL_Graphic_Renderer.Create_Material()
        Call wGL_Graphic_Renderer.Update_Material_Texture(Material(FileNum), &H0, wGL_Graphic.Create_Texture_From_Image(LoadBytes(DirGraficos & FileNum & ".PNG")))
    End If

    Dim dest As wGL_Rectangle
    dest.X1 = x
    dest.Y1 = y
    dest.X2 = x + pixelWidth
    dest.Y2 = y + pixelHeight
  
    ' Draw
    If Alpha Then
        Call wGL_Graphic_Renderer.Draw(dest, Src, Z, Angle, Color, Material(FileNum), g_TechniqueAlpha)
    Else
        Call wGL_Graphic_Renderer.Draw(dest, Src, Z, Angle, Color, Material(FileNum), g_Technique)
    End If

End Sub

Public Function wGl_Depth(ByVal Layer As Single, _
                          Optional ByVal x As Single = 1, _
                          Optional ByVal y As Single = 1, _
                          Optional ByVal Z As Single = 1) As Single
    
    wGl_Depth = -1# + (Layer * 0.1) + ((y - 1) * 0.001) + ((x - 1) * 0.00001) + ((Z - 1) * 0.000001)
    
End Function

Public Function ARGB(ByVal Red As Long, ByVal Green As Long, ByVal Blue As Long, ByVal Alpha As Long) As Long

    If Alpha > 127 Then
        ARGB = ((Alpha - 128) * &H1000000 Or &H80000000) Or Blue Or (Green * &H100&) Or (Red * &H10000)
    Else
        ARGB = (Alpha * &H1000000) Or Blue Or (Green * &H100&) Or (Red * &H10000)

    End If

End Function

Public Function GetCharacterDimension(ByVal CharIndex As Integer, ByRef RangeX As Single, ByRef RangeY As Single)

    Dim i         As Long
    Dim BestRange As Long
            
    With CharList(CharIndex)
    
        ' Try to calculate the best width and height using all four direction of the entity's body
        If (.iBody <> 0) Then

            For i = 1 To 8

                If (GrhData(.Body.Walk(i).GrhIndex).TileWidth > RangeX) Then
                    RangeX = GrhData(.Body.Walk(i).GrhIndex).TileWidth
                End If

                If (GrhData(.Body.Walk(i).GrhIndex).TileHeight > RangeY) Then
                    RangeY = GrhData(.Body.Walk(i).GrhIndex).TileHeight
                End If

            Next i

        End If
                
        ' Try to calculate the best width and height using all four direction of the entity's body
        If (.iHead <> 0) Then

            For i = 1 To 4

                If (GrhData(.Head.Head(i).GrhIndex).TileWidth > RangeX) Then
                    RangeX = GrhData(.Head.Head(i).GrhIndex).TileWidth
                End If

            Next i

            For i = 1 To 4

                If (GrhData(.Head.Head(i).GrhIndex).TileHeight > BestRange) Then
                    BestRange = GrhData(.Head.Head(i).GrhIndex).TileHeight
                End If

            Next i

            RangeY = RangeY + BestRange

        End If
            
        If (LenB(.Nombre) <> 0) Then
            RangeY = RangeY + 1
            BestRange = Len(.Nombre) * 16 / 32
            If (BestRange > RangeX) Then RangeX = BestRange
        End If
        
    End With

End Function
