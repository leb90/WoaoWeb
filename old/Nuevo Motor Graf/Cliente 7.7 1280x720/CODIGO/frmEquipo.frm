VERSION 5.00
Begin VB.Form frmEquipo 
   Appearance      =   0  'Flat
   BackColor       =   &H80000005&
   BorderStyle     =   5  'Sizable ToolWindow
   ClientHeight    =   4485
   ClientLeft      =   120
   ClientTop       =   120
   ClientWidth     =   7470
   ControlBox      =   0   'False
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "frmEquipo.frx":0000
   ScaleHeight     =   4485
   ScaleWidth      =   7470
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.PictureBox Picture5 
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      FillStyle       =   0  'Solid
      Height          =   600
      Left            =   3600
      ScaleHeight     =   540
      ScaleWidth      =   495
      TabIndex        =   5
      Top             =   3000
      Width           =   555
   End
   Begin VB.PictureBox Picture4 
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      FillStyle       =   0  'Solid
      Height          =   600
      Left            =   3120
      ScaleHeight     =   540
      ScaleWidth      =   495
      TabIndex        =   4
      Top             =   240
      Width           =   555
   End
   Begin VB.PictureBox Picture3 
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      FillStyle       =   0  'Solid
      Height          =   600
      Left            =   3600
      ScaleHeight     =   540
      ScaleWidth      =   495
      TabIndex        =   3
      Top             =   960
      Width           =   555
   End
   Begin VB.PictureBox Picture2 
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      FillStyle       =   0  'Solid
      Height          =   600
      Left            =   3480
      ScaleHeight     =   540
      ScaleWidth      =   495
      TabIndex        =   2
      Top             =   1800
      Width           =   555
   End
   Begin VB.PictureBox Picture1 
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      FillStyle       =   0  'Solid
      Height          =   600
      Left            =   4200
      ScaleHeight     =   540
      ScaleWidth      =   495
      TabIndex        =   0
      Top             =   2400
      Width           =   555
   End
   Begin VB.Image Image1 
      Height          =   480
      Left            =   5520
      Picture         =   "frmEquipo.frx":1676C
      Top             =   3720
      Width           =   1620
   End
   Begin VB.Label Label5 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Small Fonts"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   615
      Left            =   4080
      TabIndex        =   9
      Top             =   3000
      Width           =   975
   End
   Begin VB.Label Label4 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Small Fonts"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   615
      Left            =   3840
      TabIndex        =   8
      Top             =   240
      Width           =   975
   End
   Begin VB.Label Label3 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Small Fonts"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   735
      Left            =   4200
      TabIndex        =   7
      Top             =   840
      Width           =   975
   End
   Begin VB.Label Label2 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Small Fonts"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   615
      Left            =   4080
      TabIndex        =   6
      Top             =   1800
      Width           =   975
   End
   Begin VB.Label Label1 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Small Fonts"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   735
      Left            =   4920
      TabIndex        =   1
      Top             =   2280
      Width           =   855
   End
   Begin VB.Image FONDO 
      Height          =   4500
      Left            =   0
      Picture         =   "frmEquipo.frx":1B2AA
      Top             =   0
      Width           =   7500
   End
End
Attribute VB_Name = "frmEquipo"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Private DrawObj1 As clsGraphicPicture
Private DrawObj2 As clsGraphicPicture
Private DrawObj3 As clsGraphicPicture
Private DrawObj4 As clsGraphicPicture
Private DrawObj5 As clsGraphicPicture

Private Sub Form_Load()

    'Cargamos la interfase
    Me.Picture = cLoadPicture(DirInterfaces & "guerre.jpg")
    Dim n As Long
     
    For n = 1 To MAX_INVENTORY_SLOTS

        If Inventario.Equipped(n) Then

            If Inventario.ObjType(n) = 2 Then
                Set DrawObj1 = New clsGraphicPicture
                DrawObj1.Initialize Picture1, Inventario.GrhIndex(n), 0, 0
    
                Label1.Caption = "Daño: " & Inventario.MinHit(n) & "-" & Inventario.MaxHit(n) & vbCrLf & "Peso: " & Inventario.peso(n)

            End If

            If Inventario.ObjType(n) = 3 And Inventario.SubTipo(n) = 0 Then
                Set DrawObj2 = New clsGraphicPicture
                DrawObj2.Initialize Picture2, Inventario.GrhIndex(n), 0, 0
                Label2.Caption = "Defensa: " & Inventario.DefMax(n) & vbCrLf & "Peso: " & Inventario.peso(n)

            End If

            If Inventario.ObjType(n) = 3 And Inventario.SubTipo(n) = 2 Then
                Set DrawObj3 = New clsGraphicPicture
                DrawObj3.Initialize Picture3, Inventario.GrhIndex(n), 0, 0
                Label3.Caption = "Defensa: " & Inventario.DefMax(n) & vbCrLf & "Peso: " & Inventario.peso(n)

            End If

            If Inventario.ObjType(n) = 3 And Inventario.SubTipo(n) = 1 Then
                Set DrawObj4 = New clsGraphicPicture
                DrawObj4.Initialize Picture4, Inventario.GrhIndex(n), 0, 0
                Label4.Caption = "Defensa: " & Inventario.DefMax(n) & vbCrLf & "Peso: " & Inventario.peso(n)

            End If

            If Inventario.ObjType(n) = 3 And Inventario.SubTipo(n) = 3 Then
                Set DrawObj5 = New clsGraphicPicture
                DrawObj5.Initialize Picture5, Inventario.GrhIndex(n), 0, 0
                Label5.Caption = "Defensa: " & Inventario.DefMax(n) & vbCrLf & "Peso: " & Inventario.peso(n)

            End If

        End If

    Next n

End Sub

Private Sub Image1_Click()



    Set DrawObj1 = Nothing
    Set DrawObj2 = Nothing
    Set DrawObj3 = Nothing
    Set DrawObj4 = Nothing
    Set DrawObj5 = Nothing

    Unload Me

End Sub

