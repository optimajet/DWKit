#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import "RNAppAuthAuthorizationFlowManager.h"

@protocol OIDAuthorizationFlowSession;

#import <UMCore/UMAppDelegateWrapper.h>
@interface AppDelegate : UMAppDelegateWrapper <UIApplicationDelegate, RCTBridgeDelegate, RNAppAuthAuthorizationFlowManager>

@property(nonatomic, weak)id<RNAppAuthAuthorizationFlowManagerDelegate>authorizationFlowManagerDelegate;

@property (nonatomic, strong) UIWindow *window;

@end
