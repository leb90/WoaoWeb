Attribute VB_Name = "Api"
Option Explicit
Public Declare Function FindWindow Lib "user32" Alias "FindWindowA" (ByVal lpClassName As String, ByVal lpWindowName As String) As Long

Public Const WM_SETTEXT = &HC
Public Const WM_GETTEXT = &HD
Public Const WM_GETTEXTLENGTH = &HE
Public Const EM_SETREADONLY = &HCF

'[MatuX] : 24 de Marzo del 2002
Declare Function SetWindowPos& Lib "user32" (ByVal HWnd As Long, _
                                             ByVal hWndInsertAfter As Long, _
                                             ByVal X As Long, _
                                             ByVal Y As Long, _
                                             ByVal cx As Long, _
                                             ByVal cy As Long, _
                                             ByVal wFlags As Long)
'[END]
''
' Retrieves the active window's hWnd for this app.
'
' @return Retrieves the active window's hWnd for this app. If this app is not in the foreground it returns 0.

Private Declare Function GetActiveWindow Lib "user32" () As Long

''
' Checks if this is the active (foreground) application or not.
'
' @return   True if any of the app's windows are the foreground window, false otherwise.

Public Function IsAppActive() As Boolean
'***************************************************
'Author: Juan Martín Sotuyo Dodero (maraxus)
'Last Modify Date: 03/03/2007
'Checks if this is the active application or not
'***************************************************
    IsAppActive = (GetActiveWindow <> 0)
End Function
