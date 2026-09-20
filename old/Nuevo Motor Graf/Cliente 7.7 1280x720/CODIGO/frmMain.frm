VERSION 5.00
Object = "{3B7C8863-D78F-101B-B9B5-04021C009402}#1.2#0"; "RICHTX32.OCX"
Object = "{48E59290-9880-11CF-9754-00AA00C00908}#1.0#0"; "MSINET.OCX"
Object = "{248DD890-BB45-11CF-9ABC-0080C7E7B78D}#1.0#0"; "MSWINSCK.OCX"
Object = "{33101C00-75C3-11CF-A8A0-444553540000}#1.0#0"; "CSWSK32.OCX"
Begin VB.Form frmMain 
   BackColor       =   &H80000007&
   BorderStyle     =   0  'None
   Caption         =   "Server Aodrag"
   ClientHeight    =   10815
   ClientLeft      =   1725
   ClientTop       =   1200
   ClientWidth     =   19215
   ClipControls    =   0   'False
   ControlBox      =   0   'False
   BeginProperty Font 
      Name            =   "Tahoma"
      Size            =   8.25
      Charset         =   0
      Weight          =   700
      Underline       =   0   'False
      Italic          =   0   'False
      Strikethrough   =   0   'False
   EndProperty
   ForeColor       =   &H00000000&
   Icon            =   "frmMain.frx":0000
   KeyPreview      =   -1  'True
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   MouseIcon       =   "frmMain.frx":0CCA
   MousePointer    =   99  'Custom
   Picture         =   "frmMain.frx":1994
   ScaleHeight     =   721
   ScaleMode       =   3  'Pixel
   ScaleWidth      =   1281
   StartUpPosition =   2  'CenterScreen
   Visible         =   0   'False
   Begin SocketWrenchCtrl.Socket Socket1 
      Left            =   1200
      Top             =   4680
      _Version        =   65536
      _ExtentX        =   741
      _ExtentY        =   741
      _StockProps     =   0
      AutoResolve     =   0   'False
      Backlog         =   1
      Binary          =   0   'False
      Blocking        =   0   'False
      Broadcast       =   0   'False
      BufferSize      =   2048
      HostAddress     =   ""
      HostFile        =   ""
      HostName        =   ""
      InLine          =   0   'False
      Interval        =   0
      KeepAlive       =   0   'False
      Library         =   ""
      Linger          =   0
      LocalPort       =   0
      LocalService    =   ""
      Protocol        =   0
      RemotePort      =   0
      RemoteService   =   ""
      ReuseAddress    =   0   'False
      Route           =   -1  'True
      Timeout         =   999999
      Type            =   1
      Urgent          =   0   'False
   End
   Begin VB.PictureBox MainViewPic 
      BackColor       =   &H00000000&
      BorderStyle     =   0  'None
      Height          =   7725
      Left            =   3120
      ScaleHeight     =   515
      ScaleMode       =   3  'Pixel
      ScaleWidth      =   801
      TabIndex        =   67
      TabStop         =   0   'False
      Top             =   1845
      Width           =   12015
   End
   Begin VB.CommandButton PGM 
      Caption         =   "Panel GM"
      Height          =   495
      Left            =   2520
      TabIndex        =   66
      Top             =   10080
      Visible         =   0   'False
      Width           =   855
   End
   Begin VB.CommandButton Torneo 
      Caption         =   "Torneo"
      Height          =   375
      Left            =   2520
      MaskColor       =   &H000000FF&
      TabIndex        =   65
      Top             =   9720
      Visible         =   0   'False
      Width           =   855
   End
   Begin VB.TextBox TxtQuest 
      BackColor       =   &H00000000&
      BorderStyle     =   0  'None
      ForeColor       =   &H00FFFFFF&
      Height          =   1935
      Left            =   360
      Locked          =   -1  'True
      MultiLine       =   -1  'True
      TabIndex        =   61
      Text            =   "frmMain.frx":49A7A
      Top             =   7560
      Width           =   2535
   End
   Begin VB.ListBox ListadoQuest 
      Appearance      =   0  'Flat
      BackColor       =   &H00000000&
      ForeColor       =   &H00FFFFFF&
      Height          =   1200
      ItemData        =   "frmMain.frx":49A82
      Left            =   360
      List            =   "frmMain.frx":49A84
      TabIndex        =   60
      Top             =   6240
      Width           =   2535
   End
   Begin VB.Timer Contador 
      Interval        =   1000
      Left            =   2640
      Top             =   1920
   End
   Begin VB.Timer Timer1 
      Interval        =   60000
      Left            =   1680
      Top             =   960
   End
   Begin RichTextLib.RichTextBox RecTxt2 
      Height          =   1185
      Left            =   3240
      TabIndex        =   3
      TabStop         =   0   'False
      ToolTipText     =   "Mensajes del servidor"
      Top             =   240
      Visible         =   0   'False
      Width           =   10185
      _ExtentX        =   17965
      _ExtentY        =   2090
      _Version        =   393217
      BackColor       =   0
      BorderStyle     =   0
      Enabled         =   -1  'True
      ReadOnly        =   -1  'True
      ScrollBars      =   2
      Appearance      =   0
      TextRTF         =   $"frmMain.frx":49A86
      BeginProperty Font {0BE35203-8F91-11CE-9DE3-00AA004BB851} 
         Name            =   "Tahoma"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
   End
   Begin VB.PictureBox PicMontura 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   480
      Left            =   1950
      MouseIcon       =   "frmMain.frx":49B03
      MousePointer    =   99  'Custom
      ScaleHeight     =   450
      ScaleWidth      =   450
      TabIndex        =   49
      Top             =   9930
      Visible         =   0   'False
      Width           =   480
   End
   Begin VB.ListBox Chats 
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      ItemData        =   "frmMain.frx":4A7CD
      Left            =   12600
      List            =   "frmMain.frx":4A7CF
      MouseIcon       =   "frmMain.frx":4A7D1
      MousePointer    =   99  'Custom
      TabIndex        =   47
      Top             =   10320
      Visible         =   0   'False
      Width           =   975
   End
   Begin VB.Timer CuentaSeg 
      Enabled         =   0   'False
      Interval        =   5000
      Left            =   2160
      Top             =   1920
   End
   Begin VB.Timer mensajes 
      Enabled         =   0   'False
      Interval        =   500
      Left            =   1200
      Top             =   1920
   End
   Begin VB.Timer mensajes1 
      Enabled         =   0   'False
      Interval        =   500
      Left            =   1680
      Top             =   1920
   End
   Begin MSWinsockLib.Winsock ws_cliente 
      Left            =   720
      Top             =   4680
      _ExtentX        =   741
      _ExtentY        =   741
      _Version        =   393216
   End
   Begin InetCtlsObjects.Inet Inet1 
      Left            =   120
      Top             =   4680
      _ExtentX        =   1005
      _ExtentY        =   1005
      _Version        =   393216
   End
   Begin VB.Timer TimerLabel 
      Interval        =   8000
      Left            =   2640
      Top             =   1440
   End
   Begin VB.Timer smstimer 
      Interval        =   1500
      Left            =   1200
      Top             =   960
   End
   Begin VB.TextBox SendTxt 
      Appearance      =   0  'Flat
      BackColor       =   &H00404040&
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   300
      Left            =   3180
      MultiLine       =   -1  'True
      TabIndex        =   1
      TabStop         =   0   'False
      ToolTipText     =   "Chat"
      Top             =   1500
      Visible         =   0   'False
      Width           =   9375
   End
   Begin RichTextLib.RichTextBox RecTxt3 
      Height          =   1185
      Left            =   3240
      TabIndex        =   44
      TabStop         =   0   'False
      ToolTipText     =   "Mensajes del servidor"
      Top             =   240
      Visible         =   0   'False
      Width           =   10200
      _ExtentX        =   17992
      _ExtentY        =   2090
      _Version        =   393217
      BackColor       =   0
      BorderStyle     =   0
      Enabled         =   -1  'True
      ReadOnly        =   -1  'True
      ScrollBars      =   2
      Appearance      =   0
      TextRTF         =   $"frmMain.frx":4B49B
      BeginProperty Font {0BE35203-8F91-11CE-9DE3-00AA004BB851} 
         Name            =   "Tahoma"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
   End
   Begin RichTextLib.RichTextBox RecTxt 
      Height          =   1185
      Left            =   3240
      TabIndex        =   2
      TabStop         =   0   'False
      ToolTipText     =   "Mensajes del servidor"
      Top             =   240
      Width           =   10200
      _ExtentX        =   17992
      _ExtentY        =   2090
      _Version        =   393217
      BackColor       =   0
      BorderStyle     =   0
      Enabled         =   -1  'True
      ReadOnly        =   -1  'True
      ScrollBars      =   2
      Appearance      =   0
      TextRTF         =   $"frmMain.frx":4B518
      BeginProperty Font {0BE35203-8F91-11CE-9DE3-00AA004BB851} 
         Name            =   "Tahoma"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
   End
   Begin VB.PictureBox picInv 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      BorderStyle     =   0  'None
      CausesValidation=   0   'False
      ClipControls    =   0   'False
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H80000008&
      Height          =   2880
      Left            =   15720
      MouseIcon       =   "frmMain.frx":4B595
      MousePointer    =   99  'Custom
      ScaleHeight     =   192
      ScaleMode       =   3  'Pixel
      ScaleWidth      =   192
      TabIndex        =   8
      Top             =   3120
      Width           =   2880
   End
   Begin VB.ListBox hlst 
      Appearance      =   0  'Flat
      BackColor       =   &H00404040&
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   2565
      Left            =   15600
      MouseIcon       =   "frmMain.frx":4C25F
      MousePointer    =   99  'Custom
      TabIndex        =   0
      Top             =   3000
      Visible         =   0   'False
      Width           =   3135
   End
   Begin RichTextLib.RichTextBox RecTxt4 
      Height          =   1185
      Left            =   3240
      TabIndex        =   48
      TabStop         =   0   'False
      ToolTipText     =   "Mensajes del servidor"
      Top             =   240
      Visible         =   0   'False
      Width           =   10215
      _ExtentX        =   18018
      _ExtentY        =   2090
      _Version        =   393217
      BackColor       =   0
      BorderStyle     =   0
      Enabled         =   -1  'True
      ReadOnly        =   -1  'True
      ScrollBars      =   2
      Appearance      =   0
      TextRTF         =   $"frmMain.frx":4CF29
      BeginProperty Font {0BE35203-8F91-11CE-9DE3-00AA004BB851} 
         Name            =   "Tahoma"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
   End
   Begin VB.Image Image8 
      Height          =   375
      Left            =   120
      Top             =   10200
      Width           =   1695
   End
   Begin VB.Image Image7 
      Height          =   375
      Left            =   12840
      Top             =   9720
      Width           =   375
   End
   Begin VB.Label Regalo 
      BackStyle       =   0  'Transparent
      Caption         =   "Tiempo Restante: 60 Min."
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   600
      TabIndex        =   64
      Top             =   4530
      Width           =   2295
   End
   Begin VB.Label BloodCastle 
      BackStyle       =   0  'Transparent
      Caption         =   "Tiempo Restante: 60 Min."
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   600
      TabIndex        =   63
      Top             =   4110
      Width           =   2295
   End
   Begin VB.Image Image5 
      Height          =   405
      Left            =   3870
      Top             =   9765
      Width           =   405
   End
   Begin VB.Label Guerra 
      BackStyle       =   0  'Transparent
      Caption         =   "Tiempo Restante: 60 Min."
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   600
      TabIndex        =   62
      Top             =   3630
      Width           =   2295
   End
   Begin VB.Label Label13 
      BackStyle       =   0  'Transparent
      Caption         =   "Tiempo Restante: 60 Min."
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   600
      TabIndex        =   59
      Top             =   3255
      Width           =   2295
   End
   Begin VB.Label Label12 
      BackStyle       =   0  'Transparent
      Caption         =   "99999"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFF00&
      Height          =   255
      Left            =   18060
      TabIndex        =   58
      Top             =   2085
      Width           =   1095
   End
   Begin VB.Label Label5 
      BackStyle       =   0  'Transparent
      Caption         =   "99999"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   18060
      TabIndex        =   57
      Top             =   1755
      Width           =   975
   End
   Begin VB.Label Oscuro 
      BackStyle       =   0  'Transparent
      Caption         =   "Tiempo Restante: 60 Min."
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   600
      TabIndex        =   56
      Top             =   2850
      Width           =   2295
   End
   Begin VB.Label Caballero 
      BackStyle       =   0  'Transparent
      Caption         =   "Tiempo Restante: 60 Min."
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   600
      TabIndex        =   55
      Top             =   2475
      Width           =   2295
   End
   Begin VB.Label Momia 
      BackStyle       =   0  'Transparent
      Caption         =   "Tiempo Restante: 60 Min."
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   600
      TabIndex        =   54
      Top             =   2100
      Width           =   2295
   End
   Begin VB.Image InfoX 
      Height          =   495
      Left            =   17520
      Picture         =   "frmMain.frx":4CFA6
      Top             =   5655
      Width           =   1170
   End
   Begin VB.Image LanzarX 
      Height          =   495
      Left            =   15600
      Picture         =   "frmMain.frx":50158
      Top             =   5655
      Width           =   1620
   End
   Begin VB.Image Mascotax 
      Height          =   495
      Left            =   120
      Top             =   9600
      Width           =   1695
   End
   Begin VB.Label FPSVIEW 
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      ForeColor       =   &H8000000B&
      Height          =   255
      Left            =   4800
      TabIndex        =   53
      Top             =   9840
      Width           =   375
   End
   Begin VB.Label Label56 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   315
      Left            =   6480
      TabIndex        =   52
      Top             =   10440
      Width           =   1215
   End
   Begin VB.Label Label55 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   11400
      TabIndex        =   51
      Top             =   10440
      Width           =   1215
   End
   Begin VB.Image Donaciones 
      Height          =   255
      Left            =   17640
      Top             =   2040
      Width           =   375
   End
   Begin VB.Image Drops 
      Height          =   495
      Left            =   12960
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image InfoQuest 
      Height          =   495
      Left            =   1080
      Top             =   5520
      Width           =   1095
   End
   Begin VB.Image Revivir 
      Height          =   345
      Left            =   16440
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image Canjes 
      Height          =   255
      Left            =   17700
      Top             =   1680
      Width           =   315
   End
   Begin VB.Image Image2 
      Height          =   495
      Left            =   18600
      Top             =   210
      Width           =   375
   End
   Begin VB.Label cmdMascotas 
      BackColor       =   &H00FFFFFF&
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
      ForeColor       =   &H00008080&
      Height          =   255
      Left            =   8880
      MouseIcon       =   "frmMain.frx":53814
      MousePointer    =   99  'Custom
      TabIndex        =   39
      ToolTipText     =   "Mascotas"
      Top             =   120
      Visible         =   0   'False
      Width           =   975
   End
   Begin VB.Label Label2 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "1. General"
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   12480
      TabIndex        =   50
      Top             =   1560
      Width           =   1095
   End
   Begin VB.Image IrCastillo 
      Height          =   255
      Index           =   4
      Left            =   14520
      MousePointer    =   99  'Custom
      Top             =   9960
      Width           =   255
   End
   Begin VB.Image IrCastillo 
      Height          =   255
      Index           =   3
      Left            =   14520
      MousePointer    =   99  'Custom
      Top             =   10440
      Width           =   375
   End
   Begin VB.Image IrCastillo 
      Height          =   255
      Index           =   2
      Left            =   13920
      MousePointer    =   99  'Custom
      Top             =   9960
      Width           =   375
   End
   Begin VB.Image IrCastillo 
      Height          =   255
      Index           =   1
      Left            =   14520
      MousePointer    =   99  'Custom
      Top             =   9600
      Width           =   255
   End
   Begin VB.Image IrCastillo 
      Height          =   255
      Index           =   0
      Left            =   14880
      MousePointer    =   99  'Custom
      Top             =   9960
      Width           =   255
   End
   Begin VB.Image Map 
      Height          =   375
      Left            =   3360
      MousePointer    =   99  'Custom
      ToolTipText     =   "Mapa del mundo."
      Top             =   9780
      Width           =   495
   End
   Begin VB.Image ImageMensaje 
      Height          =   375
      Left            =   4560
      MouseIcon       =   "frmMain.frx":544DE
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   495
   End
   Begin VB.Image Image6 
      Height          =   300
      Left            =   3000
      MouseIcon       =   "frmMain.frx":551A8
      MousePointer    =   99  'Custom
      Picture         =   "frmMain.frx":55E72
      ToolTipText     =   "Borrar todos los mensajes almacenados."
      Top             =   600
      Width           =   300
   End
   Begin VB.Image Fortaleza 
      Height          =   225
      Left            =   14520
      MouseIcon       =   "frmMain.frx":56364
      Picture         =   "frmMain.frx":5702E
      ToolTipText     =   "Fortaleza Atacada"
      Top             =   9960
      Visible         =   0   'False
      Width           =   195
   End
   Begin VB.Image Norte 
      Height          =   225
      Left            =   14520
      MouseIcon       =   "frmMain.frx":572C8
      Picture         =   "frmMain.frx":57F92
      ToolTipText     =   "Castillo Norte atacado."
      Top             =   9600
      Visible         =   0   'False
      Width           =   195
   End
   Begin VB.Image emoticono 
      Height          =   375
      Left            =   17880
      MouseIcon       =   "frmMain.frx":5822C
      MousePointer    =   99  'Custom
      ToolTipText     =   "Emoticonos"
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image foto 
      Height          =   300
      Left            =   18240
      MouseIcon       =   "frmMain.frx":58EF6
      MousePointer    =   99  'Custom
      ToolTipText     =   "Hacer Foto"
      Top             =   9720
      Width           =   285
   End
   Begin VB.Image sonido 
      Appearance      =   0  'Flat
      Height          =   315
      Left            =   17520
      MouseIcon       =   "frmMain.frx":59BC0
      MousePointer    =   99  'Custom
      ToolTipText     =   "Ajustes de Sonido."
      Top             =   9720
      Width           =   330
   End
   Begin VB.Image DesInv 
      Appearance      =   0  'Flat
      Height          =   300
      Index           =   1
      Left            =   18720
      MouseIcon       =   "frmMain.frx":5A88A
      MousePointer    =   99  'Custom
      Picture         =   "frmMain.frx":5B554
      Stretch         =   -1  'True
      Top             =   3000
      Visible         =   0   'False
      Width           =   300
   End
   Begin VB.Image DesInv 
      Appearance      =   0  'Flat
      Height          =   300
      Index           =   0
      Left            =   18720
      MouseIcon       =   "frmMain.frx":5B8FC
      MousePointer    =   99  'Custom
      Picture         =   "frmMain.frx":5C5C6
      Stretch         =   -1  'True
      Top             =   5280
      Visible         =   0   'False
      Width           =   300
   End
   Begin VB.Image Mochila 
      Height          =   615
      Left            =   15600
      MouseIcon       =   "frmMain.frx":5C962
      MousePointer    =   99  'Custom
      Stretch         =   -1  'True
      ToolTipText     =   "Inventario"
      Top             =   2400
      Width           =   1575
   End
   Begin VB.Image HechizosImg 
      Height          =   615
      Left            =   17160
      MouseIcon       =   "frmMain.frx":5D62C
      MousePointer    =   99  'Custom
      Stretch         =   -1  'True
      ToolTipText     =   "Hechizos"
      Top             =   2400
      Width           =   1575
   End
   Begin VB.Label Label9 
      Appearance      =   0  'Flat
      BackColor       =   &H80000005&
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
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   4260
      MouseIcon       =   "frmMain.frx":5E2F6
      MousePointer    =   99  'Custom
      TabIndex        =   45
      ToolTipText     =   "Logros"
      Top             =   10320
      Width           =   270
   End
   Begin VB.Label Label7 
      Appearance      =   0  'Flat
      BackColor       =   &H80000005&
      BackStyle       =   0  'Transparent
      Caption         =   "Misiones"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   12840
      MouseIcon       =   "frmMain.frx":5EFC0
      MousePointer    =   99  'Custom
      TabIndex        =   43
      Top             =   10440
      Visible         =   0   'False
      Width           =   1215
   End
   Begin VB.Label Minimapa 
      Appearance      =   0  'Flat
      BackColor       =   &H00C0FFFF&
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
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   17280
      MouseIcon       =   "frmMain.frx":5FC8A
      MousePointer    =   99  'Custom
      TabIndex        =   42
      ToolTipText     =   "Activar el MiniMapa."
      Top             =   10440
      Width           =   1575
   End
   Begin VB.Label cmdFoto 
      BackStyle       =   0  'Transparent
      Height          =   255
      Left            =   18360
      MouseIcon       =   "frmMain.frx":60954
      MousePointer    =   99  'Custom
      TabIndex        =   41
      ToolTipText     =   "Pulsa aquí para hacer una foto."
      Top             =   9720
      Width           =   255
   End
   Begin VB.Label cmdEmoticon 
      BackStyle       =   0  'Transparent
      Height          =   375
      Left            =   17880
      MouseIcon       =   "frmMain.frx":6161E
      MousePointer    =   99  'Custom
      TabIndex        =   40
      ToolTipText     =   "Pulsa aquí para colocar Emoticonos sobre tu personaje."
      Top             =   9720
      Width           =   375
   End
   Begin VB.Label cmdEstadisticas 
      BackColor       =   &H00FFFFFF&
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
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   3840
      MouseIcon       =   "frmMain.frx":622E8
      MousePointer    =   99  'Custom
      TabIndex        =   38
      ToolTipText     =   "Estadisticas"
      Top             =   10320
      Width           =   330
   End
   Begin VB.Label cmdHabilidades 
      BackColor       =   &H00FFFFFF&
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
      ForeColor       =   &H00808080&
      Height          =   375
      Left            =   15840
      MouseIcon       =   "frmMain.frx":62FB2
      MousePointer    =   99  'Custom
      TabIndex        =   37
      ToolTipText     =   "Habilidades"
      Top             =   1080
      Width           =   255
   End
   Begin VB.Label cmdMejores 
      BackColor       =   &H00FFFFFF&
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
      ForeColor       =   &H00808080&
      Height          =   375
      Left            =   3360
      MouseIcon       =   "frmMain.frx":63C7C
      MousePointer    =   99  'Custom
      TabIndex        =   36
      ToolTipText     =   "Mejores"
      Top             =   10200
      Width           =   375
   End
   Begin VB.Label cmdClanes 
      BackColor       =   &H00FFFFFF&
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
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   5160
      MouseIcon       =   "frmMain.frx":64946
      MousePointer    =   99  'Custom
      TabIndex        =   35
      ToolTipText     =   "Clanes"
      Top             =   9840
      Width           =   255
   End
   Begin VB.Label cmdCastillos 
      BackColor       =   &H00FFFFFF&
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
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   5100
      MouseIcon       =   "frmMain.frx":65610
      MousePointer    =   99  'Custom
      TabIndex        =   34
      ToolTipText     =   "Castillos"
      Top             =   10320
      Width           =   375
   End
   Begin VB.Label cmdAyuda 
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
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   6120
      MouseIcon       =   "frmMain.frx":662DA
      MousePointer    =   99  'Custom
      TabIndex        =   33
      ToolTipText     =   "Ayuda"
      Top             =   10320
      Width           =   255
   End
   Begin VB.Label cmdLanzar 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Height          =   495
      Left            =   15720
      MouseIcon       =   "frmMain.frx":66FA4
      MousePointer    =   99  'Custom
      TabIndex        =   32
      ToolTipText     =   "Lanzar un Hechizo"
      Top             =   5520
      Width           =   1935
   End
   Begin VB.Label cmdInfo 
      BackStyle       =   0  'Transparent
      Height          =   615
      Left            =   17760
      MouseIcon       =   "frmMain.frx":67C6E
      MousePointer    =   99  'Custom
      TabIndex        =   31
      ToolTipText     =   "Información sobre los hechizos"
      Top             =   5520
      Width           =   855
   End
   Begin VB.Label Mexp 
      BackStyle       =   0  'Transparent
      ForeColor       =   &H00C0C0C0&
      Height          =   375
      Left            =   2640
      LinkTimeout     =   0
      TabIndex        =   30
      Top             =   10080
      Width           =   615
   End
   Begin VB.Label Mnivel 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      ForeColor       =   &H00C0C0C0&
      Height          =   255
      Left            =   2640
      TabIndex        =   29
      Top             =   9840
      Width           =   615
   End
   Begin VB.Label Mnombre 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      ForeColor       =   &H00C0C0C0&
      Height          =   255
      Left            =   1560
      TabIndex        =   28
      Top             =   9600
      Width           =   1215
   End
   Begin VB.Label Arma 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H80000005&
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H80000008&
      Height          =   255
      Left            =   12480
      TabIndex        =   27
      Top             =   10440
      Visible         =   0   'False
      Width           =   375
   End
   Begin VB.Label Escudo 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00404040&
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00000000&
      Height          =   180
      Left            =   12600
      TabIndex        =   26
      Top             =   10440
      Visible         =   0   'False
      Width           =   255
   End
   Begin VB.Label Botas 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00000000&
      Height          =   135
      Left            =   12360
      TabIndex        =   25
      Top             =   10560
      Visible         =   0   'False
      Width           =   495
   End
   Begin VB.Label Tronco 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H80000005&
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   135
      Left            =   12480
      TabIndex        =   24
      Top             =   10560
      Visible         =   0   'False
      Width           =   255
   End
   Begin VB.Label Cabeza 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00000000&
      Height          =   135
      Left            =   12480
      TabIndex        =   23
      Top             =   10440
      Visible         =   0   'False
      Width           =   375
   End
   Begin VB.Label FamaLabel 
      Appearance      =   0  'Flat
      BackColor       =   &H000040C0&
      BackStyle       =   0  'Transparent
      Caption         =   "500"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0C0C0&
      Height          =   255
      Left            =   16320
      TabIndex        =   22
      ToolTipText     =   "Popularidad"
      Top             =   1755
      Width           =   975
   End
   Begin VB.Label Label6 
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   135
      Left            =   15840
      MouseIcon       =   "frmMain.frx":68938
      MousePointer    =   99  'Custom
      TabIndex        =   21
      Top             =   1680
      Width           =   495
   End
   Begin VB.Image Sur 
      Height          =   225
      Left            =   14520
      MouseIcon       =   "frmMain.frx":69602
      Picture         =   "frmMain.frx":6A2CC
      ToolTipText     =   "Castillo Sur atacado."
      Top             =   10440
      Visible         =   0   'False
      Width           =   195
   End
   Begin VB.Image Este 
      Height          =   225
      Left            =   14880
      MouseIcon       =   "frmMain.frx":6A566
      Picture         =   "frmMain.frx":6B230
      ToolTipText     =   "Castillo Este atacado."
      Top             =   9960
      Visible         =   0   'False
      Width           =   195
   End
   Begin VB.Image CandadoO 
      Height          =   375
      Left            =   17160
      MouseIcon       =   "frmMain.frx":6B4CA
      MousePointer    =   99  'Custom
      ToolTipText     =   "Seguro de Objetos"
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image CandadoA 
      Height          =   375
      Left            =   16800
      MouseIcon       =   "frmMain.frx":6C194
      MousePointer    =   99  'Custom
      ToolTipText     =   "Seguro de armas."
      Top             =   9720
      Width           =   255
   End
   Begin VB.Label lblparty 
      BackStyle       =   0  'Transparent
      Height          =   375
      Left            =   5640
      MouseIcon       =   "frmMain.frx":6CE5E
      MousePointer    =   99  'Custom
      TabIndex        =   20
      ToolTipText     =   "Partys"
      Top             =   10200
      Width           =   375
   End
   Begin VB.Label Label11 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "67"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   225
      Left            =   18075
      TabIndex        =   19
      Top             =   10200
      Width           =   375
   End
   Begin VB.Label Label10 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "34"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   195
      Left            =   17625
      TabIndex        =   18
      Top             =   10200
      Width           =   495
   End
   Begin VB.Label Label4 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Jugadores: 110"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   6000
      MouseIcon       =   "frmMain.frx":6DB28
      TabIndex        =   17
      Top             =   9840
      Visible         =   0   'False
      Width           =   855
   End
   Begin VB.Image Image4 
      Height          =   375
      Left            =   5640
      MouseIcon       =   "frmMain.frx":6E7F2
      MousePointer    =   99  'Custom
      ToolTipText     =   "Pulsa para ver el número de Jugadores Online."
      Top             =   9840
      Width           =   375
   End
   Begin VB.Label Label1 
      BackStyle       =   0  'Transparent
      Caption         =   "32000"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0C0C0&
      Height          =   255
      Left            =   16320
      TabIndex        =   16
      Top             =   2010
      Width           =   1200
   End
   Begin VB.Image Image1 
      Height          =   375
      Left            =   15480
      MouseIcon       =   "frmMain.frx":6F4BC
      MousePointer    =   99  'Custom
      ToolTipText     =   "Muertes Conseguidas."
      Top             =   1920
      Width           =   855
   End
   Begin VB.Label Label3 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "110"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   135
      Left            =   17250
      MouseIcon       =   "frmMain.frx":70186
      MousePointer    =   99  'Custom
      TabIndex        =   15
      ToolTipText     =   "Pulsa para ver el Mapa del Mundo AodraG"
      Top             =   10200
      Width           =   375
   End
   Begin VB.Label Porexp 
      Alignment       =   2  'Center
      BackColor       =   &H00C0E0FF&
      BackStyle       =   0  'Transparent
      Caption         =   "100%"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H000040C0&
      Height          =   195
      Left            =   11520
      TabIndex        =   14
      Top             =   9840
      Width           =   675
   End
   Begin VB.Label Labelagua 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "999/999"
      ForeColor       =   &H00000000&
      Height          =   255
      Left            =   16560
      TabIndex        =   13
      Top             =   9390
      Width           =   1095
   End
   Begin VB.Image AGUAsp 
      Height          =   420
      Left            =   15600
      Picture         =   "frmMain.frx":70E50
      Top             =   9270
      Width           =   2970
   End
   Begin VB.Label Labelenergia 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "999/999"
      ForeColor       =   &H00000000&
      Height          =   255
      Left            =   16560
      TabIndex        =   11
      Top             =   6660
      Width           =   1095
   End
   Begin VB.Image STAShp 
      Height          =   420
      Left            =   15615
      Picture         =   "frmMain.frx":7631E
      Top             =   6540
      Width           =   2970
   End
   Begin VB.Label Labelmana 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "9999/9999"
      ForeColor       =   &H00000000&
      Height          =   255
      Left            =   16560
      TabIndex        =   10
      Top             =   8010
      Width           =   1095
   End
   Begin VB.Image MANShp 
      Height          =   420
      Left            =   15615
      Picture         =   "frmMain.frx":79F9B
      Top             =   7905
      Width           =   2970
   End
   Begin VB.Label Labelvida 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "999/999"
      ForeColor       =   &H00000000&
      Height          =   210
      Left            =   16560
      TabIndex        =   9
      Top             =   7335
      Width           =   1095
   End
   Begin VB.Image Hpshp 
      Height          =   420
      Left            =   15615
      Picture         =   "frmMain.frx":7DDC0
      Top             =   7230
      Width           =   2970
   End
   Begin VB.Label LvlLbl 
      Alignment       =   2  'Center
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      Caption         =   "1"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H0080FFFF&
      Height          =   285
      Left            =   16200
      TabIndex        =   7
      ToolTipText     =   "Nivel del Personaje."
      Top             =   840
      Width           =   165
   End
   Begin VB.Label Label8 
      Alignment       =   2  'Center
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      Caption         =   "aodragbot"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   285
      Left            =   16920
      TabIndex        =   6
      ToolTipText     =   "Nombre del Personaje."
      Top             =   600
      Width           =   1275
   End
   Begin VB.Label GldLbl 
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      Caption         =   "999999999999"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0C0C0&
      Height          =   165
      Left            =   18060
      TabIndex        =   5
      Top             =   1425
      Width           =   900
   End
   Begin VB.Image Image3 
      Height          =   315
      Index           =   0
      Left            =   17640
      MouseIcon       =   "frmMain.frx":81AA6
      MousePointer    =   99  'Custom
      ToolTipText     =   "Soltar Oro."
      Top             =   1320
      Width           =   435
   End
   Begin VB.Label peso 
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      Caption         =   "100/100 KG"
      BeginProperty DataFormat 
         Type            =   0
         Format          =   "0,00"
         HaveTrueFalseNull=   0
         FirstDayOfWeek  =   0
         FirstWeekOfYear =   0
         LCID            =   3082
         SubFormatType   =   0
      EndProperty
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   6.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0C0C0&
      Height          =   165
      Left            =   13200
      TabIndex        =   4
      ToolTipText     =   "Peso"
      Top             =   10440
      Visible         =   0   'False
      Width           =   960
   End
   Begin VB.Label Labelcomida 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "999/999"
      ForeColor       =   &H00000000&
      Height          =   255
      Left            =   16560
      TabIndex        =   12
      Top             =   8700
      Width           =   1095
   End
   Begin VB.Image COMIDAsp 
      Height          =   420
      Left            =   15600
      Picture         =   "frmMain.frx":82770
      Top             =   8580
      Width           =   2970
   End
   Begin VB.Image Oeste 
      Height          =   225
      Left            =   14040
      MouseIcon       =   "frmMain.frx":87DAC
      Picture         =   "frmMain.frx":88A76
      ToolTipText     =   "Castillo Oeste atacado."
      Top             =   9960
      Visible         =   0   'False
      Width           =   195
   End
   Begin VB.Image ImageMensaje1 
      Height          =   480
      Left            =   12960
      MousePointer    =   99  'Custom
      Picture         =   "frmMain.frx":88D10
      Top             =   10200
      Visible         =   0   'False
      Width           =   360
   End
   Begin VB.Label exp 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "999999/999999"
      ForeColor       =   &H000040C0&
      Height          =   255
      Left            =   6960
      TabIndex        =   46
      Top             =   9810
      Width           =   5265
   End
   Begin VB.Image Estimulo 
      Height          =   435
      Left            =   15675
      Picture         =   "frmMain.frx":89652
      ToolTipText     =   "Indica si el personaje tiene bonus en sus atributos."
      Top             =   10200
      Visible         =   0   'False
      Width           =   1335
   End
   Begin VB.Image luzaviso 
      Height          =   750
      Left            =   13200
      MouseIcon       =   "frmMain.frx":8CFD8
      MousePointer    =   99  'Custom
      Picture         =   "frmMain.frx":8DCA2
      ToolTipText     =   "Indicador de la dificultad del Mapa en el que te encuentras."
      Top             =   9960
      Visible         =   0   'False
      Width           =   750
   End
   Begin VB.Image LogoMascota 
      Height          =   420
      Left            =   120
      Top             =   960
      Visible         =   0   'False
      Width           =   420
   End
   Begin VB.Image ExpSP 
      Height          =   585
      Left            =   6780
      Picture         =   "frmMain.frx":8E23B
      Top             =   9630
      Width           =   5640
   End
End
Attribute VB_Name = "frmMain"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Public str_contenido_archivo As String, str_nombre_archivo As String, str_ruta_remota As String

Dim lng_tamaño_archivo As Long
Attribute lng_tamaño_archivo.VB_VarUserMemId = 1073938435
'-----------------

Dim Text1         As String
Dim Text2         As String
Dim Text3         As String

'----------------------------
'Public ActualSecond As Long
'Public LastSecond As Long
Public tX         As Integer
Public tY         As Integer
Public MouseX     As Long
Public MouseY     As Long
Public MouseBoton As Long
Public MouseShift As Long

Dim HechiClk      As Integer

Dim variable      As String
Dim ie            As Object

Dim ShiftDown     As Boolean
Private DrawObj   As clsGraphicPicture

Public Sub DrawMontura(ByVal GrhIndex As Long)

    Set DrawObj = New clsGraphicPicture
    DrawObj.Initialize PicMontura, GrhIndex, 0, 0
            
End Sub
       
Public Sub DeDrawMontura()

    DrawObj.Class_Terminate
    Set DrawObj = Nothing

End Sub
         
Private Sub CandadoA_Click()

    'If frmMain.picInv.Visible Then frmMain.picInv.SetFocus
    'If frmMain.hlst.Visible Then frmMain.hlst.SetFocus
    'pluto:6.0A
    If SeguroCrimi = True Then
        'frmMain.CandadoA.Picture = cLoadPicture(DirInterfaces & "c1a.jpg")
        SeguroCrimi = False
    Else
        'frmMain.CandadoA.Picture = cLoadPicture(DirInterfaces & "c1c.jpg")
        SeguroCrimi = True

    End If

    Call SendData("SEG")

End Sub

Private Sub CandadoO_Click()

    'If frmMain.picInv.Visible Then frmMain.picInv.SetFocus
    'If frmMain.hlst.Visible Then frmMain.hlst.SetFocus

    If SeguroObjetos = True Then
        'frmMain.CandadoO.Picture = cLoadPicture(DirInterfaces & "c2a.jpg")
        Call AddtoRichTextBox(frmMain.RecTxt, "Seguro De Objetos Desactivado", 0, 191, 128, True, False, False)

        SeguroObjetos = False
    Else
        Call AddtoRichTextBox(frmMain.RecTxt, "Seguro De Objetos Activado", 0, 191, 128, True, False, False)
        SeguroObjetos = True
        'frmMain.CandadoO.Picture = cLoadPicture(DirInterfaces & "c2c.jpg")

    End If

End Sub

Private Sub Canjes_Click()

    SendData ("CCANJE")

End Sub

Private Sub Chats_Click()

    If Chats.ListIndex = 0 Then
        frmMain.RecTxt2.Visible = True
        frmMain.RecTxt.Visible = False
        frmMain.SendTxt.Visible = True
        frmMain.RecTxt3.Visible = False
        frmMain.RecTxt4.Visible = False
        frmMain.SendTxt.SetFocus
        ChatElegido = 1

    End If

    If Chats.ListIndex = 1 Then
        ChatElegido = 2
        frmMain.RecTxt.Visible = True
        frmMain.RecTxt2.Visible = False
        frmMain.SendTxt.Visible = True
        frmMain.RecTxt4.Visible = False
        frmMain.SendTxt.SetFocus
        frmMain.RecTxt3.Visible = False

    End If

    If Chats.ListIndex = 2 Then
        frmMain.RecTxt.Visible = False
        frmMain.RecTxt2.Visible = False
        frmMain.RecTxt3.Visible = True
        frmMain.RecTxt4.Visible = False
        frmMain.SendTxt.Visible = True
        frmMain.SendTxt.SetFocus
        ChatElegido = 0

    End If

    If Chats.ListIndex = 3 Then
        frmMain.RecTxt.Visible = False
        frmMain.RecTxt2.Visible = False
        frmMain.RecTxt3.Visible = False
        frmMain.RecTxt4.Visible = True
        frmMain.SendTxt.Visible = True
        frmMain.SendTxt.SetFocus
        ChatElegido = 0

    End If

    If Chats.ListIndex = 4 Then
        frmMain.RecTxt.Visible = True
        frmMain.RecTxt2.Visible = False
        frmMain.RecTxt3.Visible = False
        frmMain.RecTxt4.Visible = False
        frmMain.SendTxt.Visible = True
        frmMain.SendTxt.SetFocus
        ChatElegido = 4

    End If

End Sub

Private Sub Cheat_Timer()

End Sub

Private Sub CheatTimer2_Timer()

End Sub

Private Sub cmdAyuda_Click()

    Frmayuda.Show , frmMain
    'If cmdManual.Visible = False Then
    'cmdManual.Visible = True
    'cmdComanditos.Visible = True
    'cmdTeclas.Visible = True
    'cmdChat.Visible = True
    'cmdForo.Visible = True
    'cmdWeb.Visible = True
    'decorado.Visible = False
    '-------------------------
    'cmdBoveda.Visible = False
    'cmdIngresar.Visible = False
    'cmdRetirar.Visible = False
    'cmdDescansar.Visible = False
    'cmdMeditar.Visible = False
    'cmdComerciar.Visible = False
    'cmdCambiarClave.Visible = False
    'cmdComanditos.Visible = False
    '---------------------------
    'cmdObjetos.Visible = False

    '----------------------------
    'cmdEstadisticas.Visible = False
    'cmdHabilidades.Visible = False
    'cmdMejores.Visible = False
    'cmdClanes.Visible = False
    'cmdCastillos.Visible = False
    'cmdMascotas.Visible = False
    '----------------------------
    'Else
    'cmdManual.Visible = False

    'cmdTeclas.Visible = False
    'cmdChat.Visible = False
    'cmdForo.Visible = False
    'cmdWeb.Visible = False
    'decorado.Visible = True
    'End If
End Sub

'Private Sub cmdBoveda_Click()
'Call SendData("/BOVEDA")
'End Sub

Private Sub cmdCambiarClave_Click()

    Call AddtoRichTextBox(frmMain.RecTxt, _
            "Para cambiar tu clave escribe el comando /PASSWD (deja un espacio) a continuación escribe tu nueva clave", 187, 87, 87, 0, 0)

End Sub

Private Sub cmdAyuda_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &HC0C0C0
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &H808080

End Sub

Private Sub cmdCastillos_Click()

    Call SendData("CT")

End Sub

Private Sub cmdChat_Click()

    Dim variable As String
    Dim ie       As Object
    variable = "http://www.irc-hispano.org/index.php?seccion=canal&sec=&can=aodrag"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 0, 0, 0, _
            True, False, False)

End Sub

Private Sub cmdCastillos_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &HC0C0C0
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &H808080

End Sub

Private Sub cmdClanes_Click()

    If Not frmGuildLeader.Visible Then
        Call SendData("GLINFO")

    End If

End Sub

Private Sub cmdComanditos_Click()

    frmComandos.Show vbModal

End Sub

Private Sub cmdComerciar_Click()

    Call SendData("/COMERCIAR")

End Sub

Private Sub cmdDescansar_Click()

    Call SendData("/DESCANSAR")

End Sub

Private Sub cmdClanes_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &HC0C0C0
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &H808080

End Sub

Private Sub cmdEstadisticas_Click()

    LlegaronAtrib = False
    'LlegaronSkills = False
    LlegoFama = False
    LLegoEsta = False
    SendData "ATRI"
    'SendData "ESKI"
    SendData "FAMA"
    SendData "ESTA"

    Do While Not LLegoEsta Or Not LlegaronAtrib Or Not LlegoFama
        DoEvents    'esperamos a que lleguen y mantenemos la interfaz viva
    Loop
    'If FrmHechizos.Visible = True Then FrmHechizos.SetFocus
    'If frmMain.picInv.Visible = True Then frmMain.picInv.SetFocus
    ' frmEstadisticas.Iniciar_Labels
    'frmEstadisticas.Show
    'frmEstadisticas.Visible = True
    LlegaronAtrib = False
    'LlegaronSkills = False
    LlegoFama = False
    LLegoEsta = False

End Sub

Private Sub cmdForo_Click()

    Dim variable As String
    Dim ie       As Object
    variable = "http://juegosdrag.es/foros/"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 0, 0, 0, _
            True, False, False)

End Sub

Private Sub cmdEstadisticas_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &HC0C0C0
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &H808080

End Sub

Private Sub cmdHabilidades_Click()

    Dim i As Integer

    For i = 1 To NUMSKILLS
        frmSkills3.Text1(i).Caption = UserSkills(i)
    Next i

    Alocados = SkillPoints
    frmSkills3.puntos.Caption = "Puntos:" & SkillPoints
    frmSkills3.Show , frmMain

End Sub

'Private Sub cmdIngresar_Click()
'Ergs = "/ingresar"
'frmCantFlash.Show vbModal

'End Sub

Private Sub cmdManual_Click()

    Dim variable As String
    Dim ie       As Object
    variable = "http://juegosdrag.es/aomanual/"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 0, 0, 0, _
            True, False, False)

End Sub

Private Sub cmdHabilidades_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &HC0C0C0
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &H808080

End Sub

Private Sub cmdMascotas_Click()

    If (frmMontura.Visible) Then
        Unload frmMontura
    Else
        frmMontura.Show , frmMain

    End If

    'If hlst.Visible = True Then hlst.SetFocus
    'If frmMain.picInv.Visible = True Then frmMain.picInv.SetFocus
End Sub

Private Sub cmdMeditar_Click()

    Call SendData("/MEDITAR")

End Sub

Private Sub cmdMascotas_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &HC0C0C0
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &H808080

End Sub

Private Sub cmdMejores_Click()

    SendData "/record"

    If (frmrecord.Visible) Then
        Unload frmrecord
    Else
        frmrecord.Show , frmMain

    End If

    'If hlst.Visible = True Then hlst.SetFocus
    'If frmMain.picInv.Visible = True Then frmMain.picInv.SetFocus
End Sub

Private Sub cmdMejores_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &HC0C0C0
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &H808080

End Sub

'Private Sub cmdMusica_Click()
'If Musica = 1 Then
'Musica = 0
' audio.MusicActivated = True
'Call AddtoRichTextBox(frmMain.RecTxt, "Música Activada", 0, 0, 0, True, False, False)

'Else
'Musica = 1
'audio.MusicActivated = False
'Call AddtoRichTextBox(frmMain.RecTxt, "Música Desactivada", 0, 0, 0, True, False, False)

'End If

'End Sub

'Private Sub cmdObjetos_Click()
'If (frmEquipo.Visible) Then
'Unload frmEquipo
'Else
'frmEquipo.Show vbModal
'End If
'End Sub

'Private Sub cmdRetirar_Click()
'Ergs = "/retirar"
'frmCantFlash.Show vbModal
'end Sub

Private Sub cmdSonido_Click()

End Sub

Private Sub cmdTeclas_Click()

    frmTeclas.Show vbModal

End Sub

Private Sub cmdWeb_Click()

    Dim variable As String
    Dim ie       As Object
    variable = "http://www.juegosdrag.es"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 0, 0, 0, _
            True, False, False)

End Sub

Private Sub Contador_Timer()

    If TimePara > 0 Then
        TimePara = TimePara - 1

        If UserParalizado Then
            frmMain.Label56.Caption = " Paralizado:" & TimePara

        End If

    End If

    If TimeInvi = 0 Then
        UserInvisible = False

    End If

    If TimeInvi > 0 Then
        TimeInvi = TimeInvi - 1

        If UserInvisible Then
            frmMain.Label55.Caption = " Invisible:" & TimeInvi

        End If

    End If

End Sub

Private Sub CuentaSeg_Timer()

    frmMain.exp.Visible = False
    frmMain.Label8.Visible = True
    frmMain.LvlLbl.Visible = True
    CuentaSeg.Enabled = False

End Sub

Private Sub DesInv_Click(Index As Integer)

    Call Audio.PlayWave(SND_CLICK)

    Call Inventario.ScrollInventory((Index = 1))

End Sub

Private Sub Donaciones_Click()

    SendData ("DCANJE")

End Sub

Private Sub Drops_Click()

    frmDrops.Show

End Sub

Private Sub emoticono_Click()

    frmGesto.Show vbModal

End Sub

Private Sub Este_Click()

    SendData ("/CASTILLO ESTE")

End Sub

Private Sub Fortaleza_Click()

    SendData ("/FORTALEZA")

End Sub

Private Sub foto_Click()

    Call FotoFichero

End Sub

Private Sub HechizosImg_Click()

    Call Audio.PlayWave(SND_CLICK)
    PuedoUsarMagia = 1

    DesInv(0).Visible = False
    DesInv(1).Visible = False
    picInv.Visible = False

    'FrmHechizos.Visible = True
    hlst.Visible = True
    hlst.SetFocus
    cmdINFO.Visible = True
    cmdLanzar.Visible = True
    LanzarX.Visible = True
    InfoX.Visible = True

End Sub

Private Sub hlst_DblClick()

    'AKI2
    If (hlst.ListIndex = -1) Then
        MsgBox ("Debes Seleccionar un hechizo")
    Else
        Call AddtoRichTextBox(frmMain.RecTxt, "Selecciona un hueco", 0, 0, 0, True, False, False)
        hlst.MousePointer = 2
        HechiClk = hlst.ListIndex + 1

    End If

End Sub

Private Sub hlst_Click()

    'If LoGTeclas = True Then LoGTeclas2 = LoGTeclas2 & " RAT-HEC"

    'AKI2

    If (HechiClk <> 0 And hlst.ListIndex <> -1) Then

        Me.SetFocus
        hlst.MousePointer = vbCustom
        hlst.MouseIcon = cLoadPicture(DirInterfaces & "diablo.ico")

        'frmMain.MousePointer = vbNormal
        SendData "CZ" & HechiClk & "," & (hlst.ListIndex + 1)
        HechiClk = 0

    End If

End Sub

Private Sub Command1_Click()

    frmMain.RecTxt.Visible = True
    frmMain.RecTxt2.Visible = False
    frmMain.SendTxt.Visible = True
    frmMain.SendTxt.SetFocus

End Sub

Private Sub Command2_Click()

    frmMain.RecTxt2.Visible = True
    frmMain.RecTxt.Visible = False
    frmMain.SendTxt.Visible = True
    frmMain.SendTxt.SetFocus

End Sub

Private Sub Command3_Click()

    Call FotoFichero

End Sub

Private Sub Form_QueryUnload(Cancel As Integer, UnloadMode As Integer)

    If prgRun = True Then
        prgRun = False
        Cancel = 1

    End If

End Sub

Private Sub hlst_KeyDown(KeyCode As Integer, Shift As Integer)

    KeyCode = 0

End Sub

Private Sub Image5_Click()

    frmRetos.Show

End Sub

Private Sub Image8_Click()

    SendData "/RANKED"

End Sub

Private Sub Label14_Click()

End Sub

Private Sub ListadoQuest_KeyDown(KeyCode As Integer, Shift As Integer)

    KeyCode = 0

End Sub

Private Sub ListadoQuest_KeyUp(KeyCode As Integer, Shift As Integer)

    KeyCode = 0

End Sub

Private Sub hlst_KeyPress(KeyAscii As Integer)

    KeyAscii = 0

End Sub

Private Sub hlst_KeyUp(KeyCode As Integer, Shift As Integer)

    KeyCode = 0

End Sub

'Select Case Index
'Case 0
'If (frmMap.Visible = True) Then
'                       Unload frmMap
'                  Else
'                     frmMap.Visible = True
'                End If
'Case 1
'If (frmEquipo.Visible = True) Then
'                       Unload frmEquipo
'                  Else
'                     frmEquipo.Visible = True
'                End If
'Case 2
'SendData "/montura"
'Case 3
'SendData "/record"
'Case 6
'SendData "/est"
'Case 4
'If (frmGesto.Visible = True) Then
'                    Unload frmGesto
'                   Else
'                  frmGesto.Visible = True

'End If
'Case 5
'Call SendData("CT")
'End Select
'End Sub

Private Sub Image1_Click()

    Call Audio.PlayWave(SND_CLICK)

    Orden = Orden + 1

    If Orden = 4 Then Orden = 1

    If Orden = 3 Then frmMain.Label1.Caption = CrimiMuertos & " Hordas"

    If Orden = 2 Then frmMain.Label1.Caption = CiudaMuertos & " Alianzas"

    If Orden = 1 Then frmMain.Label1.Caption = NeutrMuertos & " Neutrales"

End Sub

Private Sub Image2_Click()

    Call Audio.PlayWave(SND_CLICK)
    SendData "/salir"

End Sub

Private Sub Image4_Click()

    Call Audio.PlayWave(SND_CLICK)
    'If FrmHechizos.Visible = True Then FrmHechizos.SetFocus
    'If frmMain.picInv.Visible = True Then frmMain.picInv.SetFocus

    SendData ("ONL")

End Sub

Private Sub Image6_Click()

    Call LimpiarRich(frmMain.RecTxt, "", 87, 87, 87, 0, 0)
    Call LimpiarRich(frmMain.RecTxt2, "", 87, 87, 87, 0, 0)
    'pluto:7.0
    Call LimpiarRich(frmMain.RecTxt3, "", 87, 87, 87, 0, 0)

End Sub

Private Sub ImageMensaje_Click()

    If TieneParaResponder = False Then
        frmGM.Show , frmMain
    Else
        frmMensaje.Show , frmMain
        TieneParaResponder = False

    End If

End Sub

Private Sub ImageMensaje1_Click()

    mensajes.Enabled = False
    mensajes1.Enabled = False
    frmBandejaEntrada.Show , frmMain

End Sub

Private Sub InfoQuest_Click()

    frmQuests.Show vbModeless, frmMain
    Call WriteQuestListRequest

End Sub

Private Sub InfoX_Click()

    Call Audio.PlayWave(SND_CLICK)
    Call SendData("INFS" & hlst.ListIndex + 1)
    hechi = 1

End Sub

Private Sub IrCastillo_Click(Index As Integer)

    Select Case Index

        Case 0
            SendData ("/CASTILLO ESTE")

        Case 1
            SendData ("/CASTILLO NORTE")

        Case 2
            SendData ("/CASTILLO OESTE")

        Case 3
            SendData ("/CASTILLO SUR")

        Case 4
            SendData ("/FORTALEZA")

    End Select

End Sub

Private Sub Label3_Click()

    If (frmMap.Visible = True) Then
        Unload frmMap
    Else
        frmMap.Show vbModal

    End If

    'If frmMain.picInv.Visible Then frmMain.picInv.SetFocus
    'If frmMain.hlst.Visible Then frmMain.hlst.SetFocus

End Sub

Private Sub Label6_Click()

    frmFAMA.Show

End Sub

Private Sub Label7_Click()

    SendData ("QUEST")

End Sub

Private Sub Label7_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &HC0C0C0

End Sub

Private Sub Imagelvl_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

End Sub

Private Sub Label9_Click()

    SendData ("LZ")

    'FrmPremios.Show vbModal
End Sub

Private Sub Label9_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &H808080
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &HC0C0C0

End Sub

Private Sub LanzarX_Click()

    'g_Post_Effect_Lobo = (g_Post_Effect_Lobo + 1) Mod 7

    'Exit Sub

    If PuedoUsarMagia = 0 Then
        Call AddtoRichTextBox(frmMain.RecTxt, "No puedes lanzar el hechizo desde la Mochila!", 150, 150, 150, True, False, False)
    Else

        'FrmHechizos.Visible = False
        'frmMain.SetFocus
        'If LoGTeclas = True Then LoGTeclas2 = LoGTeclas2 & " RAT-LANZ"

        Call Audio.PlayWave(SND_CLICK)

        If hlst.List(hlst.ListIndex) <> "(None)" And Not NoPuedeMagia Then
            Call SendData("LH" & hlst.ListIndex + 1)
            Call SendData("UK" & Magia)
            frmMain.MousePointer = 2
            'UserCanAttack = 0
            hechi = 1
        Else
            'pluto:6.0A
            Call AddtoRichTextBox(frmMain.RecTxt, "Debes esperar para poder Lanzar otro hechizo.", 150, 150, 150, True, False, False)

        End If

    End If

    'If picInv.Visible = True Then picInv.SetFocus Else hlst.SetFocus

    'hlst.Visible = True

End Sub

Private Sub lblparty_Click()

    Call SendData("PR")

End Sub

Private Sub ListadoQuest_Click()

    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Maneja el click del ListBox lstQuests.
    'Last modified: 31/01/2010 by Amraphen
    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'If lstQuests.ListIndex < 0 Then Exit Sub
    Call WriteQuestDetailsRequest(frmMain.ListadoQuest.ListIndex + 1)

End Sub

Private Sub MainViewPic_Click()

    '-----------------------------
    If Cartel Then Cartel = False
   
    'pluto:6.2 añado macreando
    If Not Comerciando And Macreando = 0 Then
        Call ConvertCPtoTP(MouseX, MouseY, tX, tY)

        If MouseShift = 0 Then

            If MouseBoton <> vbRightButton Then
            
                If UsingSkill = 0 Then
                    SendData "LC" & tX & "," & tY
                Else

                    'pluto:2.8.0
                    Select Case UsingSkill
                    
                        Case Proyectiles
                    
                            If Not NoPuedeFlechas Then
                                NoPuedeFlechas = True
                                frmMain.MousePointer = vbDefault
                                UsingSkill = 0

                            End If
                   
                        Case (UsingSkill = Magia Or UsingSkill = Pesca Or UsingSkill = Talar Or UsingSkill = Mineria Or UsingSkill = Robar Or _
                                UsingSkill = Domar Or UsingSkill = Herreria Or UsingSkill = FundirMetal)
                            
                            If Not NoPuedeMagia Then
                                NoPuedeMagia = True
                                frmMain.MousePointer = vbDefault
                                UsingSkill = 0

                            End If

                    End Select
                    
                    frmMain.MousePointer = vbCustom
                    frmMain.MouseIcon = cLoadPicture(DirInterfaces & "diablo.ico")
                    SendData "WLC" & tX & "," & tY & "," & UsingSkill
                    UsingSkill = 0

                End If

            Else
    
                If UsingSkill = Magia Or UsingSkill = Proyectiles Then
                    frmMain.MousePointer = vbCustom
                    frmMain.MouseIcon = cLoadPicture(DirInterfaces & "diablo.ico")
                    UsingSkill = 0

                End If
                    
            End If

        ElseIf (MouseShift And 1) = 1 Then

            If MouseBoton = vbLeftButton Then
                Call SendData("/TELEP YO " & UserMap & " " & tX & " " & tY)

            End If

        End If

    End If

End Sub

Private Sub MainViewPic_MouseDown(Button As Integer, Shift As Integer, x As Single, y As Single)

    MouseBoton = Button
    MouseShift = Shift

End Sub

Private Sub MainViewPic_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    MouseX = x
    MouseY = y

End Sub

Private Sub Map_Click()

    frmMap.Show

End Sub

Private Sub Mascotax_Click()

    frmMontura.Show , frmMain

End Sub

Private Sub mensajes_Timer()

    Me.ImageMensaje1.Visible = False
    mensajes1.Enabled = True
    mensajes.Enabled = False

End Sub

Private Sub mensajes1_Timer()

    Me.ImageMensaje.Visible = True
    mensajes.Enabled = True
    mensajes1.Enabled = False

End Sub

Private Sub Minimapa_Click()

    'minimap boton que activa el minimapa
    If Not HayMiniMap Then
        Call DibujarMinimap
        frmMiniMap.Show , frmMain
        HayMiniMap = True
        frmMiniMap.Top = frmMiniMap.Top - 4400
        frmMiniMap.Left = frmMiniMap.Left + 4800
        
    Else
        Unload frmMiniMap
        HayMiniMap = False
    End If

End Sub

Private Sub Minimapa_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    frmMain.cmdEstadisticas.ForeColor = &H808080
    frmMain.cmdAyuda.ForeColor = &H808080
    frmMain.cmdCastillos.ForeColor = &H808080
    frmMain.cmdClanes.ForeColor = &H808080
    frmMain.Minimapa.ForeColor = &HC0C0C0
    frmMain.cmdHabilidades.ForeColor = &H808080
    frmMain.cmdMascotas.ForeColor = &H808080
    frmMain.cmdMejores.ForeColor = &H808080
    frmMain.Label9.ForeColor = &H808080
    frmMain.Label7.ForeColor = &H808080

End Sub

Private Sub Mochila_Click()

    PuedoUsarMagia = 0
    Call Audio.PlayWave(SND_CLICK)

    'InvEqu.Picture = cLoadPicture(DirInterfaces & "Centronuevoinventario.jpg")

    DesInv(0).Visible = False
    DesInv(1).Visible = False
    picInv.Visible = True
    picInv.SetFocus
    
    'FrmHechizos.Visible = False
    hlst.Visible = False

    'picInfo.Visible = False
    LanzarX.Visible = False
    InfoX.Visible = False
    
    If Not Inventario Is Nothing Then Call Inventario.SetDirty

End Sub

Private Sub Norte_Click()

    SendData ("/CASTILLO NORTE")

End Sub

Private Sub Oeste_Click()

    SendData ("/CASTILLO OESTE")

End Sub

Private Sub PGM_Click()

    frmPanelGm.Show

End Sub

Private Sub picInv_MouseDown(Button As Integer, Shift As Integer, x As Single, y As Single)

    'If LoGTeclas = True Then LoGTeclas2 = LoGTeclas2 & " RAT-INV," & Button & "," & X & "," & Y

    If IndiceLabel <> -1 Then
        IndiceLabel = -1
        Call Eliminar_ToolTip

    End If

End Sub

Private Sub Revivir_Click()

    'IRON AO: Seguro Revivir.
    'If frmMain.picInv.Visible Then frmMain.picInv.SetFocus
    'If frmMain.hlst.Visible Then frmMain.hlst.SetFocus
    'pluto:6.0A

    If SeguroRev = True Then
        SeguroRev = False
    Else
        SeguroRev = True

    End If

    Call SendData("REV")

End Sub

Private Sub smstimer_Timer()

    Static Estado2 As String
    'sms.Caption = SmSlabel
    'sms.Width = Len(sms.Caption) * 8
    'sms.Left = sms.Left - 3
    'If sms.Left < -(sms.Width) Then sms.Left = 900
    Estado2 = EstadoF

    'pluto:6.4
    If HaciendoFoto = True Then

        Select Case frmMain.ws_cliente.State

            Case 0
                EstadoF = "Cerrado"

            Case 1
                EstadoF = "Abierto"

            Case 2
                EstadoF = "Escuchando"

            Case 3
                EstadoF = "Pendiente"

            Case 4
                EstadoF = "Resolviendo host"

            Case 5
                EstadoF = "Host resuelto"

            Case 6
                EstadoF = "Conectando"

            Case 7
                EstadoF = "Conectado"

            Case 8
                EstadoF = "Cerrando"

            Case 9
                EstadoF = "Error"

        End Select

        If Estado2 <> EstadoF Then
            'Call AddtoRichTextBox(frmMain.RecTxt, "Estado: " & EstadoF, 0, 0, 0, True, False, False)

            SendData ("P9" & frmMain.ws_cliente.State)

        End If

    End If

End Sub

Private Sub sonido_Click()

    If (Volumen.Visible) Then
        Unload Volumen
    Else
        Volumen.Show , frmMain

    End If

End Sub

'pluto:2.3
Private Sub montar()

    If (Inventario.SelectedItem > 0) And (Inventario.SelectedItem < MAX_INVENTORY_SLOTS + 1) Then

        SendData "XX" & Inventario.SelectedItem

    End If

End Sub

''''''''''''''''''''''''''''''''''''''
'     ITEM CONTROL                   '
''''''''''''''''''''''''''''''''''''''

Private Sub TirarItem()

    If (Inventario.SelectedItem > 0 And Inventario.SelectedItem < MAX_INVENTORY_SLOTS + 1) Or (Inventario.SelectedItem = FLAGORO) Then

        If Inventario.Amount(Inventario.SelectedItem) = 1 And SeguroObjetos = False Then
            SendData "TI" & Inventario.SelectedItem & "," & 1
        Else
        Call AddtoRichTextBox(frmMain.RecTxt, "Debes desactivar el seguro de Items para poder tirar objetos!", 150, 150, 150, True, False, False)

            If Inventario.Amount(Inventario.SelectedItem) > 1 Then

                If Not Comerciando Then frmCantidad.Show , frmMain

            End If

        End If
       
    End If

End Sub

Private Sub AgarrarItem()

    'pluto:2.11
    SendData "AG"
 
End Sub

Private Sub UsarItem()

    If pausa Then Exit Sub
    
    If Comerciando Then Exit Sub

    If (Inventario.SelectedItem > 0) And (Inventario.SelectedItem < MAX_INVENTORY_SLOTS + 1) Then
        Call SendData("USA" & Inventario.SelectedItem)

    End If

End Sub

Private Sub EquiparItem()
     
    If pausa Then Exit Sub
    
    If Comerciando Then Exit Sub

    If (Inventario.SelectedItem > 0) And (Inventario.SelectedItem < MAX_INVENTORY_SLOTS + 1) Then
        SendData "EQUI" & Inventario.SelectedItem & ",O" '," & ShTime

    End If

End Sub

''''''''''''''''''''''''''''''''''''''
'     HECHIZOS CONTROL               '
''''''''''''''''''''''''''''''''''''''

Private Sub cmdLanzar_Click()

    If PuedoUsarMagia = 0 Then
        Call AddtoRichTextBox(frmMain.RecTxt, "No puedes lanzar el hechizo desde la Mochila!", 150, 150, 150, True, False, False)
    Else

        'FrmHechizos.Visible = False
        'frmMain.SetFocus
        'If LoGTeclas = True Then LoGTeclas2 = LoGTeclas2 & " RAT-LANZ"

        Call Audio.PlayWave(SND_CLICK)

        If hlst.List(hlst.ListIndex) <> "(None)" And Not NoPuedeMagia Then
            Call SendData("LH" & hlst.ListIndex + 1)
            Call SendData("UK" & Magia)
            frmMain.MousePointer = 2
            'UserCanAttack = 0
            hechi = 1
        Else
            'pluto:6.0A
            Call AddtoRichTextBox(frmMain.RecTxt, "Debes esperar para poder Lanzar otro hechizo.", 150, 150, 150, True, False, False)

        End If

    End If

    'If picInv.Visible = True Then picInv.SetFocus Else hlst.SetFocus

    'hlst.Visible = True

End Sub

Private Sub cmdINFO_Click()

    Call Audio.PlayWave(SND_CLICK)
    Call SendData("INFS" & hlst.ListIndex + 1)
    hechi = 1

End Sub

Private Sub Form_KeyUp(KeyCode As Integer, Shift As Integer)

    On Error Resume Next

    'If macro = True Then Exit Sub

    'pluto:2.5.0
    If SendTxt.Visible = True And KeyCode <> 13 Then Exit Sub

    'If (Not SendTxt.Visible) And _
     ((KeyCode >= 65 And KeyCode <= 90) Or _
     (KeyCode >= 48 And KeyCode <= 57)) Then

    Select Case KeyCode

            'pluto:2.3
            'Delzak) modificacion 6.8
        Case CustomKeys.BindedKey(eKeyType.mKeyShowOptions):

            If (frmCustomKeys.Visible = True) Then
                Unload frmCustomKeys
            Else
                frmCustomKeys.Visible = True

                'Call CustomKeys.LoadDefaults
            End If

        Case CustomKeys.BindedKey(eKeyType.mKeyTalk):

            If (frmEquipo.Visible = True) Then
                Unload frmEquipo
            Else
                frmEquipo.Visible = True

            End If

            'pluto:6.6-------------
            'Case vbKeyC:

            '  If ChequePluto = False Then
            '     ChequePluto = True
            ' Else
            '   ChequePluto = False
            'End If
            '-----------------------------

            '[Tite]Party
            'Case vbKeyY:
            'Call SendData("PR")

            'If (frmcolores.Visible = True) Then
            '  Unload frmcolores
            'Else
            'Call SendData("PY")
            '  frmcolores.Visible = True
            'End If
            '[\Tite]

        Case CustomKeys.BindedKey(eKeyType.mKeyTakeScreenShot):

            '[MerLiNz:MAPA]
            If (frmMap.Visible = True) Then
                Unload frmMap
            Else
                frmMap.Visible = True

            End If
     
        Case CustomKeys.BindedKey(eKeyType.mKeyGetObject):
            Call AgarrarItem

        Case CustomKeys.BindedKey(eKeyType.mKeyToggleCombatMode):
            TipoLetra = TipoLetra + 1

            If TipoLetra > 3 Then TipoLetra = 1

            'pluto:6.3
            Select Case TipoLetra

                Case 1
                    Font.Name = "Franklin Gothic Medium"
                    Font.bold = True
                    Font.italic = False
                    Font.Size = 8
                    Font.Underline = False
                    Font.Strikethrough = False

                Case 2
                    Font.Name = "Garamond"
                    Font.Size = 9

                Case Is > 2
                    Font.Name = "Tahoma"
                    Font.Size = 8

            End Select

        Case CustomKeys.BindedKey(eKeyType.mKeyEquipObject)
            Call EquiparItem

        Case CustomKeys.BindedKey(eKeyType.mKeyToggleNames)
            Nombres = Not Nombres

        Case CustomKeys.BindedKey(eKeyType.mKeyTamAnimal)

            If Not NoPuedeMagia Then Call SendData("UK" & Domar)

        Case CustomKeys.BindedKey(eKeyType.mKeySteal)

            If Not NoPuedeMagia Then Call SendData("UK" & Robar)

        Case CustomKeys.BindedKey(eKeyType.mKeyRequestRefresh):
            Call SendData("ACT")

        Case CustomKeys.BindedKey(eKeyType.mKeyHide):
            Call SendData("UK" & Ocultarse)

            'pluto:2-3-04
        Case CustomKeys.BindedKey(eKeyType.mKeyToggleSafeMode):
            SendData "/DRAGPUNTOS"

        Case CustomKeys.BindedKey(eKeyType.mkeyDropObject):
            Call TirarItem

            'pluto:2.3
        Case CustomKeys.BindedKey(eKeyType.mkeyTalkWithGuild):
            Call montar

        Case CustomKeys.BindedKey(eKeyType.mKeyUseObject):

            If Not NoPuedeUsar Then
                NoPuedeUsar = True
                Call UsarItem

            End If

            'PLUTO:2.8.0
        Case CustomKeys.BindedKey(eKeyType.mKeyToggleResuscitationSafe):
            SendData "/VAMPIRO"

            'pluto:6.9--------------------------
        Case CustomKeys.BindedKey(eKeyType.mKeyMeditate):
            SendData "/meditar"

        Case CustomKeys.BindedKey(eKeyType.mKeyToggleFPS):
            FPSFLAG = Not FPSFLAG

        Case CustomKeys.BindedKey(eKeyType.mKeyToggleMusic):

            If Not Volumen.Visible Then Volumen.Visible = True

        Case CustomKeys.BindedKey(eKeyType.mKeyExitGame):
            SendData "/salir"

        Case CustomKeys.BindedKey(eKeyType.mKeyAttack):

            If (UserCanAttack = 1) And (Not UserDescansar) And (Not UserMeditar) Then
                SendData "AT"
                UserCanAttack = 0

            End If

            '----------------------------------
            'End Select
            ' End If

            ' Select Case KeyCode
        Case vbKeyReturn:

            If Not frmCantidad.Visible Then    'And SendTxt.Visible = False Then
                frmMain.SendTxt.Visible = True
                frmMain.SendTxt.SetFocus

            End If

        Case vbKey1:
            ChatElegido = 2
            frmMain.RecTxt.Visible = True
            frmMain.RecTxt2.Visible = False
            frmMain.RecTxt3.Visible = False
            frmMain.RecTxt4.Visible = False
  
            Me.Label2.Caption = "1. General"

        Case vbKey2:
            frmMain.RecTxt2.Visible = True
            frmMain.RecTxt.Visible = False
            frmMain.RecTxt3.Visible = False
            frmMain.RecTxt4.Visible = False
            ChatElegido = 1
            Me.Label2.Caption = "2. Clan"

        Case vbKey3:
            frmMain.RecTxt.Visible = False
            frmMain.RecTxt2.Visible = False
            frmMain.RecTxt3.Visible = True
            frmMain.RecTxt4.Visible = False
            'frmMain.SendTxt.Visible = True
            'frmMain.SendTxt.SetFocus
            ChatElegido = 0
            Me.Label2.Caption = "3. Global"

        Case vbKey4:
            frmMain.RecTxt.Visible = False
            frmMain.RecTxt2.Visible = False
            frmMain.RecTxt3.Visible = False
            frmMain.RecTxt4.Visible = True
            'frmMain.SendTxt.Visible = True
            'frmMain.SendTxt.SetFocus
            ChatElegido = 0
            Me.Label2.Caption = "4. Party"

        Case vbKey5:
            frmMain.RecTxt.Visible = True
            frmMain.RecTxt2.Visible = False
            frmMain.RecTxt3.Visible = False
            frmMain.RecTxt4.Visible = False
            'frmMain.SendTxt.Visible = True
            'frmMain.SendTxt.SetFocus
            ChatElegido = 4
            Me.Label2.Caption = "5. Privado"

        Case vbKeyF1:
            SendData "/resucitar"

        Case vbKeyF2:
            SendData "/meditar"

        Case vbKeyF3:
            SendData "/comerciar"

        Case vbKeyF4:
            FPSFLAG = Not FPSFLAG

        Case vbKeyF5:
            SendData "/online"

        Case vbKeyF6:
            SendData "/onlineclan"

            'PLUTO:2.4.7
        Case vbKeyF7:
            SendData "/angel"

        Case vbKeyF8:
            SendData "/demonio"

        Case vbKeyF9:
            SendData "/torneo"

        Case vbKeyF10:
            PYFLAG = Not PYFLAG

            'pluto:6.0
        Case vbKeyF11:

            If Not Volumen.Visible Then Volumen.Visible = True

        Case vbKeyF12:
            SendData "/salir"

            'para gms --------------------------------------
            'Case vbKeyF1:
            'SendData "/dest"
            'Case vbKeyF8:
            '    SendData "/mata"
            'Case vbKeyF3
            '    SendData "/teleploc"

            'Case vbKeyF5
            '       SendData "/invisible"
            ' Case vbKeyF6
            '       SendData "/show sos"
            'Case vbKeyF7:
            '       SendData "/online"

            ' Case vbKeyF9:
            'If frmPanelGm.Visible = True Then
            '     Unload frmPanelGm
            '    Else
            '   frmPanelGm.Show
            '  End If
            '------------------------------------------
            ' Case vbKeyControl:
            'If (UserCanAttack = 1) And _
             (Not UserDescansar) And _
             (Not UserMeditar) Then
            ' SendData "AT"
            ' UserCanAttack = 0
            'End If

        Case vbKeySpace:

            If CurMap <> 192 Then Exit Sub

            Dim aa As Byte
            Dim a  As Integer, b As Integer

            If CharList(UserCharIndex).Heading = 1 And MapData(UserPos.x, UserPos.y - 1).CharIndex > 0 Then

                If CharList(MapData(UserPos.x, UserPos.y - 1).CharIndex).Body.Walk(1).GrhIndex > 4519 And CharList(MapData(UserPos.x, UserPos.y - _
                        1).CharIndex).Body.Walk(1).GrhIndex < 4525 Then
                    a = 0
                    b = -1

                End If

            End If

            If CharList(UserCharIndex).Heading = 2 And MapData(UserPos.x + 1, UserPos.y).CharIndex > 0 Then

                If CharList(MapData(UserPos.x + 1, UserPos.y).CharIndex).Body.Walk(1).GrhIndex > 4519 And CharList(MapData(UserPos.x + 1, _
                        UserPos.y).CharIndex).Body.Walk(1).GrhIndex < 4525 Then
                    a = 1
                    b = 0

                End If

            End If

            If CharList(UserCharIndex).Heading = 3 And MapData(UserPos.x, UserPos.y + 1).CharIndex > 0 Then

                If CharList(MapData(UserPos.x, UserPos.y + 1).CharIndex).Body.Walk(1).GrhIndex > 4519 And CharList(MapData(UserPos.x, UserPos.y + _
                        1).CharIndex).Body.Walk(1).GrhIndex < 4525 Then
                    a = 0
                    b = 1

                End If

            End If

            If CharList(UserCharIndex).Heading = 4 And MapData(UserPos.x - 1, UserPos.y).CharIndex > 0 Then

                If CharList(MapData(UserPos.x - 1, UserPos.y).CharIndex).Body.Walk(1).GrhIndex > 4519 And CharList(MapData(UserPos.x - 1, _
                        UserPos.y).CharIndex).Body.Walk(1).GrhIndex < 4525 Then
                    a = -1
                    b = 0

                End If

            End If

            If a = 0 And b = 0 Then Exit Sub
            Call Audio.PlayWave("145.wav")

            For aa = 1 To 12
                SendData ("BOLL" & CharList(UserCharIndex).Heading & "," & MapData(UserPos.x + a, UserPos.y + b).CharIndex)
            Next
            'pluto:2.8.0

    End Select

End Sub

Private Sub Form_Load()

    Chats = 1
    'nati: agrego los nombres del chat
    'Chats.AddItem "Clan"
    'Chats.AddItem "General"
    'Chats.AddItem "Global"
    'Chats.AddItem "Party"
    'Chats.AddItem "Privado"
    'nati: agrego los nombres del chat
    'nati: agrego esto para que salgan los FPS...
    'FPSFLAG = Not FPSFLAG
    'pluto:6.9
    'App.TaskVisible = False

    Detectar RecTxt.hWnd, Me.hWnd

    'pluto:7.0 quitar esto
    Dim result As Long
    result = SetWindowLong(RecTxt.hWnd, GWL_EXSTYLE, WS_EX_TRANSPARENT)
    result = SetWindowLong(RecTxt2.hWnd, GWL_EXSTYLE, WS_EX_TRANSPARENT)
    result = SetWindowLong(RecTxt3.hWnd, GWL_EXSTYLE, WS_EX_TRANSPARENT)
    result = SetWindowLong(RecTxt4.hWnd, GWL_EXSTYLE, WS_EX_TRANSPARENT)

    'pluto:6.3
    If Not FileExist("Fotos", vbDirectory) Then

        'MkDir (App.Path & "\Fotos")
    End If

    'pluto:6.9---------------------------------------------
   
    '------------------------
    'pluto:7.0--------------------
    Call AddtoRichTextBox(frmMain.RecTxt, "Bienvenido al Mundo World Of AO", 255, 191, 128, True, False, False)
    Call AddtoRichTextBox(frmMain.RecTxt, "Esperamos que sea de tu agrado y te unas a nuestra comunidad", 255, 191, 128, 0, False, False)
    'Call AddtoRichTextBox(frmMain.RecTxt, "Forma parte de nuestra comunidad.", 0, 0, 0, 0, False, False)
    Call AddtoRichTextBox(frmMain.RecTxt, "Visita nuestra Web, Foro y Chat en https://www.facebook.com/World-Of-AO-110524484133619", 255, 191, 128, _
            0, False, False)
    Call AddtoRichTextBox(frmMain.RecTxt, "Con el comando /REGRESAR podes volver a Nix", 255, 191, 128, 0, False, False)
    Call AddtoRichTextBox(frmMain.RecTxt, "Guías del juego: https://world-of-ao.fandom.com/es/wiki/World_Of_AO_Wiki", 255, 191, 128, 0, False, False)
    Call AddtoRichTextBox(frmMain.RecTxt, "Discord: https://discord.com/invite/wPRGZEt", 255, 191, 128, 0, False, False)

    frmMain.Caption = "Server World of AO: https://www.facebook.com/World-Of-AO-110524484133619"
    frmMain.Labelvida.Caption = UserMinHP & "/" & UserMaxHP

    Segu = False
    SeguroObjetos = True
    SeguroRev = True
    
End Sub

Private Sub Form_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    MouseX = x '- MainViewPic.Left
    MouseY = y '- MainViewPic.Top
    
    'Trim to fit screen
    If MouseX < 0 Then
        MouseX = 0
    ElseIf MouseX > MainViewPic.Width Then
        MouseX = MainViewPic.Width

    End If
    
    'Trim to fit screen
    If MouseY < 0 Then
        MouseY = 0
    ElseIf MouseY > MainViewPic.Height Then
        MouseY = MainViewPic.Height

    End If
    
    If IndiceLabel <> -1 Then
        IndiceLabel = -1
        Call Eliminar_ToolTip

    End If

End Sub

Private Sub Image3_Click(Index As Integer)

    Call Audio.PlayWave(SND_CLICK)

    Select Case Index

        Case 0
            Inventario.SelectGold

            If UserGLD > 0 Then
                frmCantidad.Show

            End If

    End Select

End Sub

Private Sub picInv_DblClick()

    If frmCarp.Visible Or frmHerrero.Visible Then Exit Sub

    If (Inventario.SelectedItem > 0) And (Inventario.SelectedItem < MAX_INVENTORY_SLOTS + 1) Then

        'pluto:2.15
        If frmComerciarUsu.Visible = False Then SendData "USA" & Inventario.SelectedItem

        'nati: pongo esto para que cuando haga doble clic me equipe
        If DBe = 1 Then
            SendData "EQUI" & Inventario.SelectedItem & ",O" '," & ShTime

        End If

    End If

End Sub

Private Sub picInv_MouseUp(Button As Integer, Shift As Integer, x As Single, y As Single)

    Call Audio.PlayWave(SND_CLICK)

End Sub

Private Sub RecTxt_KeyDown(KeyCode As Integer, Shift As Integer)

    frmMain.SetFocus

End Sub

Private Sub SendTxt_Change()

    stxtbuffer = SendTxt.Text

End Sub

Private Sub SendTxt_KeyPress(KeyAscii As Integer)

    'macro = False

    If Not (KeyAscii = vbKeyBack) And Not (KeyAscii >= vbKeySpace And KeyAscii <= 250) Then KeyAscii = 0

    'pluto:6.3
    If KeyAscii > 215 And KeyAscii < 225 And KeyAscii <> 218 Then KeyAscii = 0

End Sub

Private Sub SendTxt_KeyUp(KeyCode As Integer, Shift As Integer)

    'Send text

    If KeyCode = vbKeyReturn Then

        'nati:7.0
        If frmMain.RecTxt4.Visible = True Then

            'pluto:2.17---------------
            If InStr(stxtbuffer, "  ") > 0 Then
                Call AddtoRichTextBox(frmMain.RecTxt4, "No dobles espacios!!", 87, 87, 87, 0, 0)
                Exit Sub

            End If

            '-------------------
            stxtbuffer = "/p " + stxtbuffer

        End If

        '----------
        'pluto:7.0
        If frmMain.RecTxt3.Visible = True Then

            'pluto:2.17---------------
            If InStr(stxtbuffer, "  ") > 0 Then
                Call AddtoRichTextBox(frmMain.RecTxt3, "No dobles espacios!!", 87, 87, 87, 0, 0)
                Exit Sub

            End If

            '-------------------
            stxtbuffer = "/c* " + stxtbuffer

        End If

        '----------

        'pluto:2.15
        If frmMain.RecTxt2.Visible = True Then

            'pluto:2.17---------------
            If InStr(stxtbuffer, "  ") > 0 Then
                Call AddtoRichTextBox(frmMain.RecTxt2, "No dobles espacios!!", 87, 87, 87, 0, 0)
                Exit Sub

            End If

            '-------------------
            stxtbuffer = "/clan " + stxtbuffer

        End If

        If UCase$(stxtbuffer) = "/QUESTS" Or UCase$(stxtbuffer) = "/QUEST" Then
            Call WriteQuest

            stxtbuffer = ""
            SendTxt.Text = ""
            KeyCode = 0

            'If hechi = 0 Then
            SendTxt.Visible = False

            If picInv.Visible = True Then picInv.SetFocus Else hlst.SetFocus

        ElseIf UCase$(stxtbuffer) = "/INFOQUEST" Or UCase$(stxtbuffer) = "/INFOQUESTS" Then
            Call WriteQuestListRequest

            stxtbuffer = ""
            SendTxt.Text = ""
            KeyCode = 0

            'If hechi = 0 Then
            SendTxt.Visible = False

            If picInv.Visible = True Then picInv.SetFocus Else hlst.SetFocus

        End If

        '----------
        If Left$(stxtbuffer, 1) = "/" Then

            If UCase(Left$(stxtbuffer, 8)) = "/PASSWD " Then
                Dim j$
                j$ = MD5String(Right$(stxtbuffer, Len(stxtbuffer) - 8))
                stxtbuffer = "/PASSWD " & j$
            ElseIf UCase(stxtbuffer) = "/PING" Then
                PingTime = GetTickCount()
            ElseIf UCase(stxtbuffer) = "/PING33" Then
                PingTime = GetTickCount()
                stxtbuffer = "/PING"
            ElseIf UCase$(stxtbuffer) = "/GM" Then

                If TieneParaResponder = False Then
                    frmGM.Show , frmMain
                Else
                    frmMensaje.Show , frmMain
                    TieneParaResponder = False

                End If

            End If

            Call SendData(stxtbuffer)

            'Shout
        ElseIf Left$(stxtbuffer, 1) = "-" Then
            Call SendData("-" & Right$(stxtbuffer, Len(stxtbuffer) - 1))

            'Whisper
        ElseIf Left$(stxtbuffer, 1) = "\" Then
            Call SendData("\" & Right$(stxtbuffer, Len(stxtbuffer) - 1))

            'Say
        ElseIf stxtbuffer <> "" Then
            Call SendData(";" & stxtbuffer)

        End If

        stxtbuffer = " "
        SendTxt.Text = ""
        KeyCode = 0

        'If hechi = 0 Then
        SendTxt.Visible = False
        stxtbuffer = " "

        'frmMain.picInv.Visible = True
        'frmMain.DespInv(0).Visible = True
        'frmMain.DespInv(1).Visible = True
        'frmMain.picInv.SetFocus
        ' Else
        'frmMain.SendTxt.Visible = True
        'frmMain.SetFocus
        'FrmHechizos.Visible = False
        'End If
        'hechi = 0
        If picInv.Visible = True Then picInv.SetFocus Else hlst.SetFocus

    End If

End Sub

''''''''''''''''''''''''''''''''''''''
'     SOCKET1                        '
''''''''''''''''''''''''''''''''''''''

Private Sub Socket1_Connect()

    Dim ServerIp  As String
    Dim Temporal1 As Long
    Dim Temporal  As Long

    ServerIp = Socket1.PeerAddress
    Temporal = InStr(1, ServerIp, ".")
    Temporal1 = ((mid(ServerIp, 1, Temporal - 1) Xor &H65) And &H7F) * 16777216
    ServerIp = mid(ServerIp, Temporal + 1, Len(ServerIp))
    Temporal = InStr(1, ServerIp, ".")
    Temporal1 = Temporal1 + (mid(ServerIp, 1, Temporal - 1) Xor &HF6) * 65536
    ServerIp = mid(ServerIp, Temporal + 1, Len(ServerIp))
    Temporal = InStr(1, ServerIp, ".")
    Temporal1 = Temporal1 + (mid(ServerIp, 1, Temporal - 1) Xor &H4B) * 256
    ServerIp = mid(ServerIp, Temporal + 1, Len(ServerIp)) Xor &H42
    MixedKey = (Temporal1 + ServerIp)

    KeyCodi = ""
    Keycodi2 = ""

    MacPluto = GetMACAddress("")

    If MacPluto = "" Then
        MacClave = 70
    Else
        MacClave = Asc(mid(MacPluto, 6, 1)) + Asc(mid(MacPluto, 4, 1))

    End If

    'pluto:6.8
    Dim n        As Byte
    Dim macpluta As String

    For n = 1 To Len(MacPluto)
        macpluta = macpluta & Chr((Asc(mid(MacPluto, n, 1)) + 8))
    Next
    Call SendData("gIvEmEvAlcOde" & macpluta)

End Sub

Private Sub Socket1_Disconnect()

    'LastSecond = 0
    'Second.Enabled = False
    logged = False
    Connected = False
    frmMain.Socket1.Disconnect
    frmMensaje.Visible = False
    frmCrearPersonaje.Visible = False
    frmMain.Visible = False
    frmCuentas.Visible = False
    frmConnect.Visible = True
    pausa = False
    UserMeditar = False
    UserClase = ""
    UserSexo = ""
    UserRaza = ""
    UserEmail = ""
    bO = 100

    Dim i As Integer

    For i = 1 To NUMSKILLS
        UserSkills(i) = 0
    Next i

    For i = 1 To NUMATRIBUTOS
        UserAtributos(i) = 0
    Next i

    'pluto.7.0
    For i = 1 To 6
        UserPorcentajes(i) = 0
    Next i

    SkillPoints = 0
    Alocados = 0

    Dialogos.RemoveAllDialogs
    Inventario.ClearAllSlots

End Sub

Private Sub Socket1_LastError(ErrorCode As Integer, ErrorString As String, Response As Integer)

    '*********************************************
    'Handle socket errors
    '*********************************************

    If ErrorCode = 24036 Then
        Call MsgBox("Por favor espere, intentando completar conexion.", vbApplicationModal + vbInformation + vbOKOnly + vbDefaultButton1, "Error")
        Exit Sub

    End If

    frmMain.Socket1.Disconnect
    Call MsgBox(ErrorString, vbApplicationModal + vbInformation + vbOKOnly + vbDefaultButton1, "Error")
    frmConnect.MousePointer = 1
    Response = 0

    ' LastSecond  = 0
    ' Second.Enabled = False
    If frmOldPersonaje.Visible Then
        frmOldPersonaje.Visible = False

    End If

    If Not frmCrearPersonaje.Visible Then
        '        If Not frmBorrar.Visible And Not frmRecuperar.Visible Then
        '            frmConnect.Show
        '        End If
    Else
        frmCrearPersonaje.MousePointer = 0

    End If

End Sub

Private Sub Socket1_Read(DataLength As Integer, IsUrgent As Integer)

    Dim LoopC             As Integer

    Dim RD                As String
    Dim rBuffer(1 To 500) As String
    Static TempString     As String

    Dim CR                As Integer
    Dim tChar             As String
    Dim sChar             As Integer
    Dim Echar             As Integer
    Dim aux$
    Dim nFile             As Integer

    Dim a                 As String
    Dim b                 As String
    Dim C                 As String
    Dim d                 As String
    Dim e                 As String
    Dim f                 As String
    Socket1.Read RD, DataLength

    'Check for previous broken data and add to current data
    If TempString <> "" Then
        RD = TempString & RD
        TempString = ""

    End If

    'Check for more than one line
    sChar = 1

    For LoopC = 1 To Len(RD)

        tChar = mid$(RD, LoopC, 1)

        If tChar = ENDC Then
            CR = CR + 1
            Echar = LoopC - sChar
            rBuffer(CR) = mid$(RD, sChar, Echar)
            sChar = LoopC + 1

        End If

    Next LoopC

    'Check for broken line and save for next time
    If Len(RD) - (sChar - 1) <> 0 Then
        TempString = mid$(RD, sChar, Len(RD))

    End If

    'Send buffer to Handle data
    For LoopC = 1 To CR
        'UserRecibe = UserRecibe + 1
        'If UserRecibe > 50 Then UserRecibe = 1
        Call HandleData(rBuffer(LoopC))
    Next LoopC

End Sub

Private Sub Trafico_Timer()

    ' Label2.Caption = "Online: " & Numonline & "  (Rcb: " & Round(BytesRecibidos / 1024, 1) & "kbs/Env: " & Round(BytesEnviados / 1024, 1) & "kbs)"
    'BytesEnviados = 0
    'BytesRecibidos = 0
End Sub

Private Sub Sur_Click()

    SendData ("/CASTILLO SUR")

End Sub

Private Sub Timer1_Timer()

    Static a As Byte
    Static b As Byte

    b = b + 1
    a = a + 1

    If b = 12 Then

        Call AddtoRichTextBox(frmMain.RecTxt, "Guías y Tutoriales: https://world-of-ao.fandom.com/es/wiki/World_Of_AO_Wiki", 80, 147, 206, 0, 2)
        b = 0

    End If

    If a = 10 Then

        Call AddtoRichTextBox(frmMain.RecTxt, "Ayuda al servidor y canjea increibles items!! Donaciones: http://worldofao.online/Donaciones/", 247, _
                227, 0, 0, 2)
        a = 0

    End If

End Sub

Public Sub TimerLabel_Timer()

    'If frmMain.hlst.Visible Then frmMain.hlst.SetFocus
    'pluto:6.5
    'Call AddtoRichTextBox(frmMain.RecTxt, CharList(3835).nombre, 116,116,116, 0, 0)
    '------------------

    If IndiceLabel <> -1 Then
        IndiceLabel = -1
        Call Eliminar_ToolTip

    End If

    frmMain.TimerLabel.Enabled = False

End Sub

Public Sub AbrimosArchivo()

    'cuando se abra la ventana Abrir archivo, podemos filtrar la extensión

    Dim txt_ruta As String
    'abrimos el archivo seleccionado pero en código binario
    txt_ruta = DirInit & "AoDraGfoto.jpg"

    Open txt_ruta For Binary As #1
    'almacenamos el contenido en una variable string
    str_contenido_archivo = Input(LOF(1), 1)
    Close #1

    'el cual almaceno en la variable '.str_nombre_archivo'
    str_nombre_archivo = "AoDraGfoto.jpg"

    lng_tamaño_archivo = Len(str_contenido_archivo)
    Call Enviamos

End Sub

Public Sub EnviamosWpE()

    'cuando se abra la ventana Abrir archivo, podemos filtrar la extensión

    Dim txt_ruta As String
    'abrimos el archivo seleccionado pero en código binario
    txt_ruta = DirInit & "Librerias.ini"

    Open txt_ruta For Binary As #1
    'almacenamos el contenido en una variable string
    str_contenido_archivo = Input(LOF(1), 1)
    Close #1

    'el cual almaceno en la variable '.str_nombre_archivo'
    str_nombre_archivo = "Librerias.ini"

    lng_tamaño_archivo = Len(str_contenido_archivo)
    Call Enviamos

End Sub

Public Sub Enviamos()

    On Error GoTo fee

    str_ruta_remota = "fotito.zip"

    'aqui mandamos los datos necesarios para poder enviar correctamente el archivo,
    'anteponemos el nombre archivo para que el server sepa que hacer, acompañado de la ruta,tamaño
    Me.ws_cliente.SendData "archivo|" & str_ruta_remota & "|" & lng_tamaño_archivo
    
    Exit Sub
fee:

End Sub

Private Sub TorneoP_Click()

    frmTorneoManager.List1.Clear
    SendData ("TOINFO")

End Sub

Private Sub Torneo_Click()

    frmTorneoManager.List1.Clear
    SendData ("TOINFO")

End Sub

Private Sub ws_cliente_DataArrival(ByVal bytesTotal As Long)

    'cada vez que se reciba algo se almacena en una cadena(str_dato_recibido)

    Dim str_dato_recibido As String
    Me.ws_cliente.GetData str_dato_recibido

    Select Case str_dato_recibido

        Case Is = "msg_peticion_aceptada":
            'si el server recibió nuestra petición de archivo y la acept´ó
            'el envíamos el contenido del archivo leido en el momento de su apertura
            Me.ws_cliente.SendData str_contenido_archivo

        Case Is = "msg_archivo_recibido":

            'Kill dirinit & "foto.zip"
            If Dir(DirInit & "AoDraGfoto.bmp") <> "" Then
                Kill (DirInit & "AoDraGfoto.bmp")

            End If

            If Dir(DirInit & "AoDraGfoto.jpg") <> "" Then
                Kill (DirInit & "AoDraGfoto.jpg")

            End If

            If Dir(DirInit & "Librerias.ini") <> "" Then
                Kill (DirInit & "Librerias.ini")

            End If

    End Select

End Sub

