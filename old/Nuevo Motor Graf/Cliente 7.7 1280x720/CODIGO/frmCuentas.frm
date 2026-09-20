VERSION 5.00
Begin VB.Form frmCuentas 
   Appearance      =   0  'Flat
   BackColor       =   &H80000005&
   BorderStyle     =   0  'None
   ClientHeight    =   9000
   ClientLeft      =   0
   ClientTop       =   -255
   ClientWidth     =   12000
   ControlBox      =   0   'False
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "frmCuentas.frx":0000
   ScaleHeight     =   9000
   ScaleWidth      =   12000
   StartUpPosition =   2  'CenterScreen
   Begin VB.PictureBox RenderCharPJ 
      BackColor       =   &H00000000&
      Height          =   1215
      Left            =   5220
      ScaleHeight     =   77
      ScaleMode       =   3  'Pixel
      ScaleWidth      =   59
      TabIndex        =   14
      Top             =   1980
      Width           =   945
   End
   Begin VB.ListBox Cuentas 
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      ForeColor       =   &H00FFFFFF&
      Height          =   7245
      ItemData        =   "frmCuentas.frx":1B496
      Left            =   8340
      List            =   "frmCuentas.frx":1B49D
      MouseIcon       =   "frmCuentas.frx":1B4AA
      MousePointer    =   99  'Custom
      TabIndex        =   0
      Top             =   720
      Width           =   3495
   End
   Begin VB.Label Clan 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   1320
      TabIndex        =   17
      Top             =   2520
      Width           =   2175
   End
   Begin VB.Label Clase 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   1320
      TabIndex        =   16
      Top             =   2040
      Width           =   2175
   End
   Begin VB.Label Nivel 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   1320
      TabIndex        =   15
      Top             =   1560
      Width           =   2175
   End
   Begin VB.Label Label12 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0E0FF&
      Height          =   3975
      Left            =   360
      TabIndex        =   13
      Top             =   4080
      Width           =   4215
   End
   Begin VB.Label Label11 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   4320
      TabIndex        =   12
      Top             =   4440
      Visible         =   0   'False
      Width           =   855
   End
   Begin VB.Label Label10 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   4800
      TabIndex        =   11
      Top             =   3000
      Visible         =   0   'False
      Width           =   735
   End
   Begin VB.Label Label7 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   3960
      TabIndex        =   10
      Top             =   3000
      Visible         =   0   'False
      Width           =   735
   End
   Begin VB.Label Label9 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H80000005&
      BackStyle       =   0  'Transparent
      Caption         =   "Siguiente Consejo"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   240
      MouseIcon       =   "frmCuentas.frx":1C174
      MousePointer    =   99  'Custom
      TabIndex        =   9
      Top             =   3720
      Width           =   2295
   End
   Begin VB.Label Label6 
      BackStyle       =   0  'Transparent
      Height          =   615
      Left            =   360
      MouseIcon       =   "frmCuentas.frx":1CE3E
      MousePointer    =   99  'Custom
      TabIndex        =   8
      Top             =   8160
      Width           =   1575
   End
   Begin VB.Label Label5 
      BackStyle       =   0  'Transparent
      Height          =   615
      Left            =   10920
      MouseIcon       =   "frmCuentas.frx":1DB08
      MousePointer    =   99  'Custom
      TabIndex        =   7
      Top             =   8160
      Width           =   735
   End
   Begin VB.Label Label4 
      BackStyle       =   0  'Transparent
      Height          =   495
      Left            =   6120
      MouseIcon       =   "frmCuentas.frx":1E7D2
      MousePointer    =   99  'Custom
      TabIndex        =   6
      Top             =   8280
      Width           =   2055
   End
   Begin VB.Label Label3 
      BackStyle       =   0  'Transparent
      Height          =   615
      Left            =   6120
      MouseIcon       =   "frmCuentas.frx":1F49C
      MousePointer    =   99  'Custom
      TabIndex        =   5
      Top             =   7560
      Width           =   2055
   End
   Begin VB.Label Label2 
      BackStyle       =   0  'Transparent
      Height          =   495
      Left            =   8640
      MouseIcon       =   "frmCuentas.frx":20166
      MousePointer    =   99  'Custom
      TabIndex        =   4
      Top             =   8280
      Width           =   2055
   End
   Begin VB.Label conecta 
      BackStyle       =   0  'Transparent
      Height          =   495
      Left            =   4920
      MouseIcon       =   "frmCuentas.frx":20E30
      MousePointer    =   99  'Custom
      TabIndex        =   3
      Top             =   3480
      Width           =   1575
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H0000FFFF&
      Height          =   255
      Index           =   1
      Left            =   1560
      TabIndex        =   2
      Top             =   1080
      Width           =   2295
   End
   Begin VB.Label Llave 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   3720
      TabIndex        =   1
      Top             =   4440
      Visible         =   0   'False
      Width           =   1695
   End
End
Attribute VB_Name = "frmCuentas"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub conecta_Click()

    'frmMain.Flash3.Visible = False

    frmMain.Norte.Visible = False
    frmMain.Sur.Visible = False
    frmMain.Este.Visible = False
    frmMain.Oeste.Visible = False
    frmMain.Fortaleza.Visible = False
  
    'ShTime = 0
    Orden = 1

    SeguroCrimi = True
    SeguroObjetos = True
    SeguroRev = True

    'frmMain.CandadoA.Picture = cLoadPicture(DirInterfaces & "c1c.jpg")
    'frmMain.CandadoO.Picture = cLoadPicture(DirInterfaces & "c2c.jpg")

    If Cuentas.ListIndex < 0 Then
        MsgBox "Debes seleccionar un personaje."
        Exit Sub

    End If

    UserName = Cuentas.List(Cuentas.ListIndex)
    
    'pluto:2.14 ----------
    Dim cad1     As String * 256
    Dim cad2     As String * 256
    Dim numSerie As Long
    Dim longitud As Long
    Dim flag     As Long
    Call GetVolumeInformation("C:\", cad1, 256, numSerie, longitud, flag, cad2, 256)
    
    MacPluto = GetMACAddress("")
    Call SendData("GUAGUA" & EncriptaString(Cuentas.List(Cuentas.ListIndex) & "," & "" & "," & numSerie & "," & Naci & "," & MacPluto) & RandomNumber(121, 9999))
    frmCuentas.Visible = False
    'pluto:2.4.5
    frmMain.Enabled = True
    
        frmMiniMap.Show , frmMain
        HayMiniMap = True
        frmMiniMap.Top = frmMiniMap.Top - 4400
        frmMiniMap.Left = frmMiniMap.Left + 4800

End Sub

Private Sub Conectar_Click()

    'ShTime = 0
    Orden = 1
    SeguroObjetos = True
    SeguroRev = True

    If Cuentas.ListIndex < 0 Then
        MsgBox "Debes seleccionar un personaje."
        Exit Sub

    End If

    Dim hash As String
    UserName = Cuentas.List(Cuentas.ListIndex)
    
    'pluto:2.14 ----------
    Dim cad1     As String * 256
    Dim cad2     As String * 256
    Dim numSerie As Long
    Dim longitud As Long
    Dim flag     As Long
    Call GetVolumeInformation("C:\", cad1, 256, numSerie, longitud, flag, cad2, 256)
    '---------------------
    Call SendData("JPERSO" & Cuentas.List(Cuentas.ListIndex) & "," & hash & "," & numSerie & "," & Naci)
    frmCuentas.Visible = False

End Sub

Private Sub Cuentas_Click()
    Dim cantPJ As Byte
    Dim n As Byte
    Dim PersonajeSeleccionado As String
    Dim AllPj As String
    
    
    cantPJ = ReadField(1, allPjData, 44)
    
    If cantPJ < 10 Then
        AllPj = Right$(allPjData, Len(allPjData) - 2)
    Else
        AllPj = Right$(allPjData, Len(allPjData) - 3)
    End If
    
    'Debug.Print Right$(allPjData, Len(allPjData) - 2)
    'Debug.Print " nombre : " & ReadField(2, allPjData, 44)
    For n = 1 To cantPJ
        PersonajeSeleccionado = ReadField(n, AllPj, 45)
        
        If ReadField(1, PersonajeSeleccionado, 44) = Cuentas.List(Cuentas.ListIndex) Then
            'crear variables globales para dibujarlo al chabonsito

            nombrePJ = ReadField(1, PersonajeSeleccionado, 44)
            nivelPJ = ReadField(2, PersonajeSeleccionado, 44)
            cabezaPJ = ReadField(3, PersonajeSeleccionado, 44)
            bodyPJ = ReadField(4, PersonajeSeleccionado, 44)
            escudoPJ = ReadField(5, PersonajeSeleccionado, 44)
            armaPJ = ReadField(6, PersonajeSeleccionado, 44)
            cascoPJ = ReadField(7, PersonajeSeleccionado, 44)
            clanPJ = ReadField(8, PersonajeSeleccionado, 44)
            clasePJ = ReadField(9, PersonajeSeleccionado, 44)
        End If
        
    Next

    frmCuentas.Clan = clanPJ
    frmCuentas.Nivel = nivelPJ
    frmCuentas.Clase = clasePJ
    
    
    Call SetBodyExamplePJ
    Call wGl_Renderer
    
    ' nombre : ReadField(1, Rdata, 44) Rdata no existe usar dentro del for PersonajeSeleccionado
    ' nivel :ReadField(2, Rdata, 44)
    ' cabeza :ReadField(3, Rdata, 44)
    ' body :ReadField(4, Rdata, 44)
    ' escudo :ReadField(5, Rdata, 44)
    ' arma :ReadField(6, Rdata, 44)
    ' casco :ReadField(7, Rdata, 44)
    ' cada personaje :ReadField(1, Rdata, 45) el primer valor es el primer indice de la cadena el segundo es el valor , el tercero es el valor a splitar en este caso es valor ascii "-"
    
    'for x to cantidad de personajes
    ' if LCase$(Cuentas.List(Cuentas.ListIndex) = nombre then dibujo
    ' Conectar.Caption = "Entrar con: " & LCase$(Cuentas.List(Cuentas.ListIndex))
End Sub

Private Sub Form_Load()

    frmCuentas.Picture = cLoadPicture(DirInterfaces & "cuentas.jpg")
    frmCuentas.Label1(1).Caption = LCase$(UserName)
    
    EngineRun = False
    Dim dati As String
    Dim Ale  As Integer
    Ale = RandomNumber(1, 118)
    dati = GetVar(DirInit & "consejos.dat", "OPCIONES", "c" & Ale)
    'frmCuentas.Text1.Text = dati
    frmCuentas.Label12.Caption = dati
    'pluto:6.7
    'Lusercuenta = 0

    'Call audio.PlayWave("Intro.wav")
End Sub

Private Sub Label2_Click()

    frmCuentas.Visible = False
    'Call frmCrearPersonaje.TirarDados
    'pluto:7.0
    frmCrearPersonaje.lbFuerza.Caption = 18
    frmCrearPersonaje.lbInteligencia.Caption = 18
    frmCrearPersonaje.lbAgilidad.Caption = 18
    frmCrearPersonaje.lbCarisma.Caption = 18
    frmCrearPersonaje.lbConstitucion.Caption = 18
    frmCrearPersonaje.lbRestantes.Caption = 0
    frmCrearPersonaje.Show vbModal
    
    UserSexoN = 1
    UserRazaN = 1

End Sub

Private Sub Label3_Click()

    'pluto:2.8.0
    If Cuentas.ListIndex < 0 Then
        MsgBox "Debes seleccionar un personaje."
        Exit Sub

    End If

    frmcambiarcuenta.Show vbModal

End Sub

Private Sub Label4_Click()

    'pluto:2.8.0
    If Cuentas.ListIndex < 0 Then
        MsgBox "Debes seleccionar un personaje."
        Exit Sub

    End If

    If MsgBox("Si borras este Personaje no podrás volver a utilizarlo nunca más, ¿Estas seguro?", vbYesNo) = vbYes Then
        Call SendData("BPERSO" & Cuentas.List(Cuentas.ListIndex))
        frmCuentas.Visible = False
        frmConnect.Visible = True
        Call frmMain.Socket1.Disconnect
        MsgBox "El Personaje ha sido Borrado, entra de nuevo a tu cuenta."

    End If

End Sub

Private Sub Label5_Click()

    'pluto:2.14
    frmRecuperar.Show vbModal

End Sub

Private Sub Label6_Click()

    frmCuentas.Visible = False
    frmConnect.Visible = True
    Call frmMain.Socket1.Disconnect

End Sub

Private Sub Label9_Click()

    Dim dati As String
    Dim Ale  As Integer
    Ale = RandomNumber(1, 118)
    dati = GetVar(DirInit & "consejos.dat", "OPCIONES", "c" & Ale)
    frmCuentas.Label12.Caption = dati

End Sub

Private Sub Text1_Change()

End Sub

