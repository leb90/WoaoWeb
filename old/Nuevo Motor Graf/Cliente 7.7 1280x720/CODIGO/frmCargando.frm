VERSION 5.00
Object = "{3B7C8863-D78F-101B-B9B5-04021C009402}#1.2#0"; "RICHTX32.ocx"
Begin VB.Form frmCargando 
   AutoRedraw      =   -1  'True
   BackColor       =   &H00000000&
   BorderStyle     =   0  'None
   ClientHeight    =   7500
   ClientLeft      =   1005
   ClientTop       =   810
   ClientWidth     =   9975
   ControlBox      =   0   'False
   ForeColor       =   &H00000000&
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   MouseIcon       =   "frmCargando.frx":0000
   MousePointer    =   99  'Custom
   ScaleHeight     =   500
   ScaleMode       =   3  'Pixel
   ScaleWidth      =   665
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin RichTextLib.RichTextBox Status 
      Height          =   2145
      Left            =   3360
      TabIndex        =   0
      TabStop         =   0   'False
      ToolTipText     =   "Mensajes del servidor"
      Top             =   2760
      Width           =   3675
      _ExtentX        =   6482
      _ExtentY        =   3784
      _Version        =   393217
      BackColor       =   0
      BorderStyle     =   0
      Enabled         =   -1  'True
      HideSelection   =   0   'False
      ReadOnly        =   -1  'True
      Appearance      =   0
      OLEDragMode     =   0
      OLEDropMode     =   0
      TextRTF         =   $"frmCargando.frx":0CCA
      MouseIcon       =   "frmCargando.frx":0D4D
      BeginProperty Font {0BE35203-8F91-11CE-9DE3-00AA004BB851} 
         Name            =   "Arial Narrow"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   -1  'True
         Strikethrough   =   0   'False
      EndProperty
   End
   Begin VB.Image LOGO 
      Height          =   7500
      Left            =   0
      Picture         =   "frmCargando.frx":0D69
      Top             =   0
      Width           =   9990
   End
End
Attribute VB_Name = "frmCargando"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Private Sub Form_Load()

    Dim result As Long
    result = SetWindowLong(status.hWnd, GWL_EXSTYLE, WS_EX_TRANSPARENT)
    LOGO.Picture = cLoadPicture(DirInterfaces & "mar.jpg")

End Sub

'IRON AO: Auto Update
Private Sub Inet1_StateChanged(ByVal State As Integer)

End Sub

