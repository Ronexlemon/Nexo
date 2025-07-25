import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";
import { CustomBottomSheet } from "./BottomSheet";
import PrimaryButton from "./PrimaryButton";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Account, WalletClient, Hex, formatUnits } from "viem";
import { decodedFunction } from "../utills/decodeddata";

type HexString = `0x${string}`;

type ConfirmationTokenDetails = {
    value?: HexString;
    to: HexString;
    data: HexString;
    nonce?: number | undefined;
};

type userClient = {
    client: WalletClient;
    account: HexString | Account;
};

// Removed the confirm and cancel props from the interface
export interface ConfirmationTokenProps {
    token: ConfirmationTokenDetails;
    open: boolean;
    walletclient: userClient;
}

// Utility function to format and truncate a long address for readability
const formatAddress = (address: HexString, length = 6): string => {
    if (!address || address.length < length * 2 + 2) {
        return address;
    }
    return `${address.substring(0, length + 2)}...${address.substring(address.length - length)}`;
};

export const ConfirmationTokenSend = (props: ConfirmationTokenProps) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const hasPresentedRef = useRef(false);

    const [decodedTx, setDecodedTx] = useState<{ functionName: string; args: readonly any[] } | null>(null);
    const [displayAmount, setDisplayAmount] = useState<string | null>(null);

    // Effect to decode the transaction data whenever `props.token.data` changes
    useEffect(() => {
        if (props.token.data) {
            const result = decodedFunction(props.token.data);
            setDecodedTx(result);

            if (result && result.functionName === 'transfer') {
                const [_, amountInWei] = result.args;
                setDisplayAmount(formatUnits(amountInWei as bigint, 18));
            } else {
                setDisplayAmount(null);
            }
        } else {
            setDisplayAmount(null);
            setDecodedTx(null);
        }
    }, [props.token.data]);

    // Effect to control the bottom sheet's open/close state based on props.open
    useEffect(() => {
        if (props.open && !hasPresentedRef.current) {
            bottomSheetRef.current?.present();
            hasPresentedRef.current = true;
        } else if (!props.open && hasPresentedRef.current) {
            bottomSheetRef.current?.dismiss();
            hasPresentedRef.current = false;
        }
    }, [props.open]);

    // Memoized function to handle dismissal and reset internal state
    const handleDismissal = useCallback(() => {
        hasPresentedRef.current = false;
        bottomSheetRef.current?.dismiss();
    }, []);

    // Function to handle sending the transaction
    const handleSendTraction = async () => {
        try {
            const valueToSend = decodedTx && decodedTx.functionName === 'transfer'
                ? 0n
                : BigInt(props.token.value || '0');

            await props.walletclient.client?.sendTransaction({
                account: props.walletclient.account,
                to: props.token.to,
                value: valueToSend,
                data: props.token.data,
                nonce: props.token.nonce,
                chain: undefined
            });

            handleDismissal();
        } catch (e: any) {
            console.error('Native: viem sendTransaction error:', e);
            handleDismissal();
        } finally {
            // Clear all state after the transaction is handled (send or fail)
            setDecodedTx(null);
            setDisplayAmount(null);
        }
    };

    // Function to handle canceling the transaction
    const handleCancel = () => {
        handleDismissal();
        // Clear all state on cancel
        setDecodedTx(null);
        setDisplayAmount(null);
    };

    const isErc20Transfer = decodedTx && decodedTx.functionName === 'transfer';

    // The component will only render the bottom sheet if there is data
    if (!props.token.data) {
        return null;
    }

    return (
        <CustomBottomSheet ref={bottomSheetRef} snapPoints={["100%"]} title="Confirm Transaction">
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.content}>
                        {isErc20Transfer ? (
                            <Text style={styles.mainMessage}>
                                <Text style={styles.highlightedText}>{displayAmount}</Text> Tokens
                            </Text>
                        ) : (
                            <Text style={styles.mainMessage}>
                                Contract Interaction
                            </Text>
                        )}
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Recipient</Text>
                            <Text style={styles.detailValue}>
                                {formatAddress(props.token.to)}
                            </Text>
                        </View>
                        
                        {props.token.value && BigInt(props.token.value) > 0n && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Native Value</Text>
                                <Text style={styles.detailValue}>
                                    {formatUnits(BigInt(props.token.value), 18)} ETH
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.buttonRow}>
                        <PrimaryButton title="Cancel" onPress={handleCancel} style={styles.cancelButton} />
                        <PrimaryButton title="Send" onPress={handleSendTraction} style={styles.sendButton} />
                    </View>
                </View>
            </SafeAreaView>
        </CustomBottomSheet>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 32,
        justifyContent: "space-between",
    },
    content: {
        flex: 1,
        alignItems: "center",
    },
    mainMessage: {
        fontSize: 28,
        fontWeight: '600',
        color: '#212529',
        textAlign: 'center',
        marginBottom: 32,
    },
    highlightedText: {
        fontWeight: 'bold',
        color: '#343a40',
    },
    detailRow: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    detailLabel: {
        fontWeight: "500",
        color: "#6c757d",
        fontSize: 16,
    },
    detailValue: {
        fontSize: 16,
        color: "#212529",
        fontFamily: 'monospace',
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 32,
        gap: 16,
    },
    sendButton: {
        flex: 1,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#e9ecef',
        color: '#495057',
        
    }
});