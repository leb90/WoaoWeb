Attribute VB_Name = "Consola_Inteligente"
Option Explicit
Private Declare Function SetWindowLong Lib "user32" Alias "SetWindowLongA" (ByVal HWnd As Long, ByVal nIndex As Long, ByVal dwNewLong As Long) As Long
Private Declare Function SendMessage Lib "user32" Alias "SendMessageA" (ByVal HWnd As Long, _
                                                                        ByVal wMsg As Long, _
                                                                        ByVal wParam As Long, _
                                                                        lParam As Any) As Long
Private Declare Sub CopyMemory Lib "kernel32" Alias "RtlMoveMemory" (destination As Any, source As Any, ByVal length As Long)
Private Declare Function CallWindowProc Lib "user32" Alias "CallWindowProcA" (ByVal lpPrevWndFunc As Long, _
                                                                              ByVal HWnd As Long, _
                                                                              ByVal msg As Long, _
                                                                              ByVal wParam As Long, _
                                                                              ByVal lParam As Long) As Long
Private Declare Function ShellExecute Lib "shell32" Alias "ShellExecuteA" (ByVal HWnd As Long, _
                                                                           ByVal lpOperation As String, _
                                                                           ByVal lpFile As String, _
                                                                           ByVal lpParameters As String, _
                                                                           ByVal lpDirectory As String, _
                                                                           ByVal nShowCmd As Long) As Long
'Geodar
Const EM_SETEVENTMASK = &H445
Const EN_LINK = &H70B
Const ENM_LINK = &H4000000
Const EM_AUTOURLDETECT = &H45B
Const EM_GETEVENTMASK = &H43B
Const GWL_WNDPROC = (-4)    'Geodar
Const WM_NOTIFY = &H4E    'Geodar
Const WM_LBUTTONDOWN = &H201
Const EM_GETTEXTRANGE = &H44B
Private Const SW_SHOW = 5

Dim lOldProc   As Long
Dim hWndRTB    As Long
Dim hWndParent As Long

'Geodar
Private Type NMHDR    'Geodar

    hWndFrom As Long
    idFrom As Long
    code As Long

End Type    'Geodar

Private Type CHARRANGE

    cpMin As Long
    cpMax As Long

End Type

'Geodar
Private Type ENLINK

    hdr As NMHDR
    msg As Long
    wParam As Long    'Geodar
    lParam As Long
    chrg As CHARRANGE    'Geodar

End Type

'Geodar
Private Type TEXTRANGE

    chrg As CHARRANGE
    lpstrText As String

End Type

Public Sub Detectar(ByVal hWndTextbox As Long, ByVal hWndOwner As Long)

    'Don't want to subclass twice!
    If lOldProc = 0 Then
        'Subclass!
        lOldProc = SetWindowLong(hWndOwner, GWL_WNDPROC, AddressOf WndProc)
        SendMessage hWndTextbox, EM_SETEVENTMASK, 0, ByVal ENM_LINK Or SendMessage(hWndTextbox, EM_GETEVENTMASK, 0, 0)
        SendMessage hWndTextbox, EM_AUTOURLDETECT, 1, ByVal 0
        hWndParent = hWndOwner    'Geodar
        hWndRTB = hWndTextbox

    End If

End Sub

Public Sub NoDetectar()

    If lOldProc Then
        SendMessage hWndRTB, EM_AUTOURLDETECT, 0, ByVal 0
        'Reset the window procedure (stop the subclassing)
        SetWindowLong hWndParent, GWL_WNDPROC, lOldProc
        'Set this to 0 so we can subclass again in future
        lOldProc = 0

    End If

End Sub

Public Function WndProc(ByVal HWnd As Long, ByVal uMsg As Long, ByVal wParam As Long, ByVal lParam As Long) As Long

    Dim uHead As NMHDR    'Geodar
    Dim eLink As ENLINK
    Dim eText As TEXTRANGE
    Dim sText As String
    Dim lLen  As Long    'Geodar

    'Which message?
    Select Case uMsg    'Geodar

        Case WM_NOTIFY
            'Copy the notification header into our structure from the pointer
            CopyMemory uHead, ByVal lParam, Len(uHead)

            If (uHead.hWndFrom = hWndRTB) And (uHead.code = EN_LINK) Then
                CopyMemory eLink, ByVal lParam, Len(eLink)

                'What kind of message?
                Select Case eLink.msg    'Geodar

                    Case WM_LBUTTONDOWN
                        eText.chrg.cpMin = eLink.chrg.cpMin
                        eText.chrg.cpMax = eLink.chrg.cpMax    'Geodar
                        eText.lpstrText = Space$(1024)
                        lLen = SendMessage(hWndRTB, EM_GETTEXTRANGE, 0, eText)
                        sText = Left$(eText.lpstrText, lLen)
                        ShellExecute hWndParent, vbNullString, sText, vbNullString, vbNullString, SW_SHOW

                End Select

            End If    'Geodar

    End Select

    WndProc = CallWindowProc(lOldProc, HWnd, uMsg, wParam, lParam)    'Geodar

End Function
