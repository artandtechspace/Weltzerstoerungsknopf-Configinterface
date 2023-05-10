
export type DialogButton = {
    text: string,
    action?: ()=>void; // No default action
    closeOnAction?: boolean // Default is true
}

// Function to forward a call to open a dialog to the locally placed dialog within the page
// This is mostly used to ensure type-safety remains
export function openDialog(base: any, message: string, title: string, color: string, buttons: DialogButton[]) {
    base.$refs.dialog.open(message, title, color, buttons);
}

// Function to forward a call to open a snackbar to the locally placed snackbar within the page
// This is mostly used to ensure type-safety remains
export function openSnackbar(base: any, message: string, color: string, icon: string, length: number = 1200) {
    base.$refs.snackbar.open(message, color, icon, length);
}